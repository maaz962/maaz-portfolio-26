import { Github, Linkedin, Mail } from "lucide-react";
import type { SocialLink } from "@/types";

/**
 * Central place for identity/brand copy. Update this file to change the
 * name, focus areas, tagline, contact links, and file placeholders
 * (profile photo, resume) everywhere at once.
 */
export const profile = {
  name: "M. Maaz Arif",
  initials: "MA",
  // Short positioning line rendered in the Hero as
  // "Full Stack Developer • React / Next.js • Flutter • Cybersecurity".
  focusAreas: ["Full Stack Developer", "React / Next.js", "Flutter", "Cybersecurity"],
  tagline:
    "I build for the web with React and Next.js, for mobile with Flutter, and I spend a fair amount of time trying to break my own projects so they hold up better.",
  status: "Available for freelance work",
  location: "Lahore, Pakistan",
  email: "muhammadmaaz4405@gmail.com",
  github: "https://github.com/maaz962",
  linkedin: "https://www.linkedin.com/in/maaz-arif-webdev/",
  // TODO: Replace this placeholder with M. Maaz Arif's professional profile photo.
  // Drop the final image at /public/images/profile.jpg (recommended: square,
  // at least 800x800px) and update this path. See README "Profile photo".
  photoSrc: "/images/profile.jpg",
  // TODO: Add the final PDF resume at /public/resume/maaz-arif-resume.pdf.
  // The "Download Resume" button in the Hero already links to this path —
  // it will start working as soon as the file exists at that location.
  // See public/resume/PLACE_RESUME_PDF_HERE.txt for the same note in place.
  resumeSrc: "/resume/maaz-arif-resume.pdf",
  // TODO: Add M. Maaz Arif's verified WhatsApp number here when available.
  // Format: Use international format without '+' or leading zeros, e.g., "923001234567"
  // If left empty, the WhatsApp option inside the AI chat will be hidden or fall back gracefully.
  whatsapp: "",
};

export const socialLinks: SocialLink[] = [
  { label: "GitHub", href: profile.github, icon: Github },
  { label: "LinkedIn", href: profile.linkedin, icon: Linkedin },
  { label: "Email", href: `mailto:${profile.email}`, icon: Mail },
];
