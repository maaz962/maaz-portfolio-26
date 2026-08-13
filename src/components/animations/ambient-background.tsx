"use client";

import { motion } from "framer-motion";

/**
 * The site's visual signature: a faint architectural grid, two slow-pulsing
 * gradient auras (purple + cyan), and a thin scanning glow line. Reads as
 * "developer / security-minded" without becoming literal or busy. Intended
 * to sit once behind the hero, not repeated on every section.
 */
export function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="bg-grid absolute inset-0" />

      <motion.div
        className="glow-orb -left-32 -top-32 h-[420px] w-[420px] bg-primary/40"
        animate={{ opacity: [0.25, 0.5, 0.25], scale: [1, 1.08, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="glow-orb -right-24 top-1/3 h-[360px] w-[360px] bg-accent/30"
        animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.06, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />

      <motion.div
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        initial={{ top: "-5%" }}
        animate={{ top: ["-5%", "105%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
      />
    </div>
  );
}
