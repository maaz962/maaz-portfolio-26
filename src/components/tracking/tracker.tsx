"use client";

import { useEffect, useRef, useCallback } from "react";
import type { TrackingEvent } from "@/types/tracking";

function getBrowserFingerprint() {
  return {
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screenResolution: `${screen.width}x${screen.height}`,
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    hardwareConcurrency: navigator.hardwareConcurrency,
    platform: navigator.platform,
  };
}

function getCookies(): Record<string, string> {
  const cookies: Record<string, string> = {};
  document.cookie.split(";").forEach((c) => {
    const [key, ...val] = c.trim().split("=");
    if (key) cookies[key] = val.join("=");
  });
  return cookies;
}

export function Tracker() {
  const eventsRef = useRef<TrackingEvent[]>([]);
  const flushTimerRef = useRef<ReturnType<typeof setInterval>>();
  const startTimeRef = useRef(Date.now());
  const maxScrollRef = useRef(0);

  const addEvent = useCallback((event: TrackingEvent) => {
    eventsRef.current.push(event);
  }, []);

  const flushEvents = useCallback(async () => {
    if (eventsRef.current.length === 0) return;

    const events = [...eventsRef.current];
    eventsRef.current = [];

    const timeOnPage = Math.round((Date.now() - startTimeRef.current) / 1000);

    events.push({
      type: "time",
      target: "page",
      data: `${timeOnPage}s | scroll:${maxScrollRef.current}%`,
      timestamp: new Date().toISOString(),
    });

    const fingerprint = getBrowserFingerprint();

    try {
      await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: window.location.hash || "#top",
          language: fingerprint.language,
          timezone: fingerprint.timezone,
          screenResolution: fingerprint.screenResolution,
          cookies: getCookies(),
          events,
        }),
        keepalive: true,
      });
    } catch {}
  }, []);

  useEffect(() => {
    startTimeRef.current = Date.now();

    addEvent({
      type: "pageview",
      target: window.location.hash || "#top",
      data: document.title,
      timestamp: new Date().toISOString(),
    });

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const tag = target.tagName.toLowerCase();
      const text = (target.textContent || "").trim().slice(0, 50);
      const href = (target.closest("a") as HTMLAnchorElement)?.href || "";
      addEvent({
        type: "click",
        target: `${tag}${href ? `:${href}` : ""}`,
        data: text,
        timestamp: new Date().toISOString(),
      });
    };

    // Cache the scrollable range instead of reading scrollHeight on every
    // scroll event (forced synchronous layout). Re-measure only when the
    // document actually changes size.
    let maxScrollableHeight = 1;
    const measureScrollRange = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      maxScrollableHeight = Math.max(1, scrollable);
    };
    measureScrollRange();
    const resizeObserver = new ResizeObserver(measureScrollRange);
    resizeObserver.observe(document.documentElement);

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const scrollPercent = Math.round(
          (window.scrollY / maxScrollableHeight) * 100
        );
        if (scrollPercent > maxScrollRef.current) {
          maxScrollRef.current = scrollPercent;
        }
      });
    };

    const handleCopy = () => {
      addEvent({
        type: "copy",
        target: "document",
        timestamp: new Date().toISOString(),
      });
    };

    const handleVisibilityChange = () => {
      addEvent({
        type: "visibility",
        target: document.visibilityState,
        timestamp: new Date().toISOString(),
      });
    };

    const handleResize = () => {
      addEvent({
        type: "resize",
        target: `${window.innerWidth}x${window.innerHeight}`,
        timestamp: new Date().toISOString(),
      });
    };

    const handleHashChange = () => {
      addEvent({
        type: "pageview",
        target: window.location.hash || "#top",
        timestamp: new Date().toISOString(),
      });
    };

    document.addEventListener("click", handleClick, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("copy", handleCopy, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("resize", handleResize);
    window.addEventListener("hashchange", handleHashChange);

    flushTimerRef.current = setInterval(flushEvents, 30000);

    const handleBeforeUnload = () => {
      navigator.sendBeacon(
        "/api/track",
        new Blob(
          [
            JSON.stringify({
              page: window.location.hash || "#top",
              language: navigator.language,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              screenResolution: `${screen.width}x${screen.height}`,
              cookies: getCookies(),
              events: [
                ...eventsRef.current,
                {
                  type: "time",
                  target: "page",
                  data: `${Math.round((Date.now() - startTimeRef.current) / 1000)}s | scroll:${maxScrollRef.current}%`,
                  timestamp: new Date().toISOString(),
                },
              ],
            }),
          ],
          { type: "application/json" }
        )
      );
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      resizeObserver.disconnect();
      if (flushTimerRef.current) clearInterval(flushTimerRef.current);
    };
  }, [addEvent, flushEvents]);

  return null;
}
