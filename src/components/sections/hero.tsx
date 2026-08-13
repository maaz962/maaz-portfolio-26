import { ArrowRight, Download, Github, Linkedin } from "lucide-react";
import { profile, socialLinks } from "@/data/profile";
import { Container } from "@/components/ui/container";
import { buttonStyles, iconLinkStyles } from "@/components/ui/button";
import { ProfilePhoto } from "@/components/ui/profile-photo";
import { AmbientBackground } from "@/components/animations/ambient-background";
import { FadeIn } from "@/components/animations/fade-in";

const heroSocialIcons = { GitHub: Github, LinkedIn: Linkedin } as const;

export function Hero() {
  const heroSocials = socialLinks.filter(
    (link): link is typeof link & { label: keyof typeof heroSocialIcons } =>
      link.label in heroSocialIcons
  );

  return (
    <section
      id="top"
      className="bg-noise scroll-mt-20 relative overflow-hidden border-b border-border"
    >
      <AmbientBackground />

      <Container className="relative grid gap-12 py-20 md:grid-cols-[1.15fr_0.85fr] md:items-center md:py-28">
        <FadeIn>
          {/* Micro status indicator — small, quiet, no glow abuse. */}
          <div className="text-mono inline-flex items-center gap-2 rounded-full border border-border bg-background-secondary px-3 py-1 text-xs text-muted">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            {profile.status}
          </div>

          <h1 className="mt-5 text-4xl text-foreground sm:text-5xl md:text-6xl">
            {profile.name}
          </h1>

          <p className="text-mono mt-3 text-sm text-primary sm:text-base">
            {profile.focusAreas.join(" • ")}
          </p>

          <p className="mt-6 max-w-xl text-balance text-lg text-muted">
            {profile.tagline}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a href="#projects" className={buttonStyles({ size: "lg" })}>
              View My Work
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </a>
            <a
              href="#contact"
              className={buttonStyles({ variant: "outline", size: "lg" })}
            >
              Hire Me
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {heroSocials.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noreferrer noopener"
                className={iconLinkStyles()}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </a>
            ))}
            {/*
              TODO: Add the final PDF resume at /public/resume/maaz-arif-resume.pdf.
              This button already links to that path via profile.resumeSrc —
              it will work as soon as the file exists there.
            */}
            <a
              href={profile.resumeSrc}
              download
              className={buttonStyles({ variant: "ghost", size: "sm" })}
            >
              <Download className="h-4 w-4" strokeWidth={1.75} />
              Download Resume
            </a>
          </div>
        </FadeIn>

        <FadeIn delay={0.15} offset={12}>
          <ProfilePhoto className="mx-auto max-w-xs md:max-w-sm" />
        </FadeIn>
      </Container>
    </section>
  );
}
