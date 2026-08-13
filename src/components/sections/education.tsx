"use client";

import { GraduationCap } from "lucide-react";
import { education } from "@/data/education";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { FadeIn } from "@/components/animations/fade-in";
import {
  StaggerFadeIn,
  StaggerItem,
} from "@/components/animations/stagger-fade-in";
import { cn } from "@/lib/utils";

export function Education() {
  return (
    <section
      id="education"
      aria-labelledby="education-heading"
      className="scroll-mt-20 border-b border-border bg-background-secondary/30 py-24"
    >
      <Container>
        <FadeIn>
          <SectionHeading
            eyebrow="Academics"
            title="Education"
            description="Where I'm studying now and the path that led here."
          />
        </FadeIn>

        <StaggerFadeIn className="relative mt-14 space-y-0">
          <div
            aria-hidden
            className="absolute bottom-4 left-[1.125rem] top-4 w-px bg-border md:left-6"
          />

          {education.map((entry) => (
            <StaggerItem key={`${entry.degree}-${entry.institution}`}>
              <article
                className={cn(
                  "relative grid gap-4 pb-10 pl-10 md:grid-cols-[minmax(0,1fr)_auto] md:pl-14 md:pb-12",
                  entry.current && "pb-12"
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-3 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border md:left-[1.125rem]",
                    entry.current
                      ? "border-primary bg-primary/15 shadow-glow"
                      : "border-border bg-card"
                  )}
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      entry.current ? "bg-primary" : "bg-muted/60"
                    )}
                  />
                </span>

                <div
                  className={cn(
                    "rounded-2xl border p-6 transition-colors",
                    entry.current
                      ? "border-primary/40 bg-card shadow-glow"
                      : "border-border bg-card/80"
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                          entry.current
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "border-border bg-background-secondary text-muted"
                        )}
                      >
                        <GraduationCap className="h-5 w-5" strokeWidth={1.75} />
                      </span>
                      <div>
                        <h3
                          id={entry.current ? "education-heading" : undefined}
                          className="text-lg text-foreground md:text-xl"
                        >
                          {entry.degree}
                        </h3>
                        <p className="mt-1 text-sm text-muted">
                          {entry.institution}
                        </p>
                      </div>
                    </div>
                    {entry.current ? (
                      <span className="text-mono rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
                        In progress
                      </span>
                    ) : null}
                  </div>
                </div>

                <p className="text-mono self-start pt-2 text-sm text-muted md:pt-6 md:text-right">
                  {entry.startDate} – {entry.endDate}
                </p>
              </article>
            </StaggerItem>
          ))}
        </StaggerFadeIn>
      </Container>
    </section>
  );
}
