/**
 * Single source of truth for the home page's section order.
 *
 * The SectionViewer renders one section at a time; the mobile dock and the
 * prev/next pager both need the same ids + human labels, so they live here
 * instead of being duplicated across components.
 */
export const sections = [
  { id: "top", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Education" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "services", label: "Services" },
  { id: "contact", label: "Contact" },
] as const;

export type SectionId = (typeof sections)[number]["id"];

export const sectionIds: readonly SectionId[] = sections.map((s) => s.id);
