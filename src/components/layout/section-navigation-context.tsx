"use client";

import { createContext, useContext } from "react";

export const SectionNavigationContext = createContext<(id: string) => void>(
  () => {}
);

export function useSectionNavigation() {
  return useContext(SectionNavigationContext);
}

/**
 * One-shot pending contact subject, set before navigating to the Contact
 * section (e.g. from a service's "Inquire about this" link) so the form
 * can pre-fill the Subject field on mount.
 */
let pendingContactSubject: string | null = null;

export function setPendingContactSubject(subject: string | null) {
  pendingContactSubject = subject;
}

export function takePendingContactSubject(): string | null {
  const subject = pendingContactSubject;
  pendingContactSubject = null;
  return subject;
}
