"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** Distance in pixels the content travels up while fading in. */
  offset?: number;
}

const baseVariants = (offset: number): Variants => ({
  hidden: { opacity: 0, y: offset },
  visible: { opacity: 1, y: 0 },
});

/**
 * Single orchestrated reveal used for section content. Respects
 * prefers-reduced-motion via Framer Motion's transition-duration override
 * in globals.css and Motion's built-in reduced-motion handling.
 */
export function FadeIn({
  children,
  delay = 0,
  className,
  offset = 20,
}: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={baseVariants(offset)}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
