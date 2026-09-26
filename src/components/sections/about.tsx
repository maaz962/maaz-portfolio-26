"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Briefcase, Check, Copy, GraduationCap } from "lucide-react";
import { aboutContent } from "@/data/about";
import { profile } from "@/data/profile";
import { Section } from "@/components/ui/section";
import { SectionGlow } from "@/components/ui/section-glow";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { TerminalWindow } from "@/components/ui/terminal-window";
import { Chip } from "@/components/ui/chip";
import { FadeIn } from "@/components/animations/fade-in";

const beyondIcons = {
  briefcase: Briefcase,
  graduation: GraduationCap,
} as const;

const IDENTITY_JSON = `{
  "name": "${profile.name}",
  "role": "CS student & developer",
  "stack": [
    "React", "Next.js",
    "Flutter", "Dart",
    "PHP", "MySQL"
  ],
  "also": [
    "freelancer",
    "web dev instructor"
  ],
  "learning": [
    "cybersecurity",
    "networking"
  ]
}`;

export function About() {
  const [copied, setCopied] = useState(false);
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeout.current) clearTimeout(copyTimeout.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(IDENTITY_JSON);
      setCopied(true);
      if (copyTimeout.current) clearTimeout(copyTimeout.current);
      copyTimeout.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Section
      id="about"
      aria-label="About"
      className="bg-noise relative overflow-hidden"
    >
      <SectionGlow
        primaryClassName="top-20 bg-primary/15"
        accentClassName="bg-accent/10"
      />

      <Container className="relative">
        <FadeIn>
          <SectionHeading
            eyebrow="Profile"
            title="About"
            description="A quick read on who I am, what I build, and what I'm working on right now."
          />
        </FadeIn>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <FadeIn delay={0.05}>
            <div className="space-y-8">
              <p className="max-w-prose text-lg leading-relaxed text-foreground/90">
                {aboutContent.intro}
              </p>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="text-xl text-foreground">
                    {aboutContent.identity.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-muted">
                    {aboutContent.identity.body}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl text-foreground">
                    {aboutContent.learning.title}
                  </h3>
                  <ul className="space-y-1.5 text-[15px] text-muted">
                    {aboutContent.learning.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <ArrowRight
                          className="mt-1 h-3.5 w-3.5 shrink-0 text-primary"
                          aria-hidden="true"
                          strokeWidth={2}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background-secondary/50 p-6">
                <h3 className="text-xl text-foreground">
                  {aboutContent.builds.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {aboutContent.builds.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-[15px] text-muted"
                    >
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                        aria-hidden
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-eyebrow">Areas &amp; tools</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {aboutContent.focusAreas.map((area) => (
                    <li key={area}>
                      <Chip>{area}</Chip>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.12} offset={12}>
            <div className="space-y-6">
              <TerminalWindow
                title="~/about/identity.json"
                actions={
                  <button
                    type="button"
                    onClick={handleCopy}
                    aria-label={copied ? "JSON copied" : "Copy identity.json to clipboard"}
                    className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-background-secondary px-2.5 text-xs text-muted transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5" strokeWidth={2} />
                    ) : (
                      <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </button>
                }
              >
                <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs leading-relaxed sm:text-sm">
                  {IDENTITY_JSON}
                </pre>
              </TerminalWindow>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-card transition-colors hover:border-primary/35 md:p-8">
                <h3 className="text-sm font-semibold text-foreground">
                  {aboutContent.aside.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {aboutContent.aside.items.map((item) => {
                    const Icon = beyondIcons[item.icon];
                    return (
                      <li key={item.label} className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" strokeWidth={1.75} />
                        </span>
                        <div>
                          <p className="text-[15px] font-semibold text-foreground">
                            {item.label}
                          </p>
                          <p className="mt-0.5 text-[13px] leading-relaxed text-muted">
                            {item.detail}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </FadeIn>
        </div>
      </Container>
    </Section>
  );
}