"use client";

import { useState } from "react";
import { Tracker } from "@/components/tracking/tracker";
import { CookieConsent } from "@/components/tracking/cookie-consent";

const CONSENT_KEY = "maaz-cookie-consent";

/**
 * Gates the visitor Tracker behind an explicit cookie-consent decision.
 * - No stored decision  -> show the CookieConsent banner.
 * - "accepted"          -> mount the Tracker (and keep it mounted for the
 *                          rest of the session once the user accepts).
 * - "declined"          -> never track on this browser.
 *
 * Relies on states to avoid a full reload when the user accepts.
 */
export function AnalyticsGate() {
  const [tracking, setTracking] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(CONSENT_KEY) === "accepted";
    } catch {
      return false;
    }
  });

  return (
    <>
      {tracking ? (
        <Tracker />
      ) : (
        <CookieConsent
          onAccept={() => {
            setTracking(true);
          }}
        />
      )}
    </>
  );
}
