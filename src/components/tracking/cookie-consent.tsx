"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, X } from "lucide-react";

export interface CookieConsentProps {
  /** Called immediately after the user accepts, so tracking can start. */
  onAccept?: () => void;
}

export function CookieConsent({ onAccept }: CookieConsentProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("maaz-cookie-consent");
    if (!consent) setShow(true);
  }, []);

  const accept = () => {
    localStorage.setItem("maaz-cookie-consent", "accepted");
    setShow(false);
    onAccept?.();
  };

  const decline = () => {
    localStorage.setItem("maaz-cookie-consent", "declined");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-card backdrop-blur-xl sm:left-auto sm:right-4 sm:max-w-md"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Cookie Notice</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                This site collects basic analytics (page views, clicks, browser info) to improve your experience. No personal data is sold or shared.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={decline}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
            >
              Decline
            </button>
            <button
              onClick={accept}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:brightness-110"
            >
              Accept
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
