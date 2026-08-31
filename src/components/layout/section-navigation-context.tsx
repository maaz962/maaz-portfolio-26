"use client";

import { createContext, useContext } from "react";

export const SectionNavigationContext = createContext<(id: string) => void>(
  () => {}
);

export function useSectionNavigation() {
  return useContext(SectionNavigationContext);
}
