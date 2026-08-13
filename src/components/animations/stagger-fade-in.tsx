"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface StaggerFadeInProps {
  children: ReactNode;
  className?: string;
  /** Delay between each child reveal, in seconds. */
  stagger?: number;
  /** Initial delay before the first child animates. */
  delay?: number;
}

const containerVariants = (
  stagger: number,
  delay: number
): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
      delayChildren: delay,
    },
  },
});

const itemVariants = (offset: number): Variants => ({
  hidden: { opacity: 0, y: offset },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
});

/**
 * Staggered scroll reveal for lists/grids of items. Each direct child
 * should be a motion-friendly element or wrapped in StaggerItem.
 */
export function StaggerFadeIn({
  children,
  className,
  stagger = 0.08,
  delay = 0,
}: StaggerFadeInProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={containerVariants(stagger, delay)}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  offset = 16,
}: {
  children: ReactNode;
  className?: string;
  offset?: number;
}) {
  return (
    <motion.div className={className} variants={itemVariants(offset)}>
      {children}
    </motion.div>
  );
}
