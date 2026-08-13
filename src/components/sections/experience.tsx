"use client";

import { experience } from "@/data/experience";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { FadeIn } from "@/components/animations/fade-in";
import {
  StaggerFadeIn,
  StaggerItem,
} from "@/components/animations/stagger-fade-in";
import { cn } from "@/lib/utils";

export function Experience() {
  return (
    <section
      id="experience"
      className="scroll-mt-20 border-b border-border py-24"
    >
      <Container>
        <FadeIn>
          <SectionHeading
            eyebrow="Timeline"
            title="Experience"
            description="Leadership and volunteer work with the UAF Freelancing Club under the Senior Tutor Office."
          />
        </FadeIn>

        <StaggerFadeIn className="relative mt-14">
          <div
            aria-hidden
            className="absolute bottom-6 left-[1.125rem] top-2 w-px bg-gradient-to-b from-primary/50 via-border to-border md:left-6"
          />

          <div className="space-y-0">
            {experience.map((entry, index) => (
              <StaggerItem key={`${entry.role}-${entry.period}`}>
                <article
                  className={cn(
                    "relative grid gap-6 pb-12 pl-10 md:grid-cols-[220px_minmax(0,1fr)] md:gap-10 md:pl-14",
                    index === experience.length - 1 && "pb-0"
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "absolute left-3 top-2 flex h-6 w-6 items-center justify-center rounded-full border md:left-[1.125rem]",
                      entry.featured
                        ? "border-primary bg-primary/15 shadow-glow"
                        : "border-border bg-card"
                    )}
                  >
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        entry.featured ? "bg-primary" : "bg-muted/60"
                      )}
                    />
                  </span>

                  <div className="md:pt-1">
                    <p className="text-mono text-xs uppercase tracking-widest text-primary">
                      {entry.period}
                    </p>
                    {entry.featured ? (
                      <span className="text-mono mt-2 inline-block rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[0.65rem] uppercase tracking-wide text-primary">
                        Current
                      </span>
                    ) : null}
                  </div>

                  <div
                    className={cn(
                      "rounded-2xl border p-6 md:p-7",
                      entry.featured
                        ? "border-primary/35 bg-card shadow-glow"
                        : "border-border bg-card/90"
                    )}
                  >
                    <header>
                      <h3 className="text-xl text-foreground">{entry.role}</h3>
                      <p className="mt-1 text-sm font-medium text-foreground/90">
                        {entry.organization}
                      </p>
                      {entry.affiliation ? (
                        <p className="mt-1 text-sm text-muted">
                          {entry.affiliation}
                        </p>
                      ) : null}
                    </header>

                    {entry.summary ? (
                      <p className="mt-4 text-sm leading-relaxed text-muted">
                        {entry.summary}
                      </p>
                    ) : null}

                    {entry.highlights && entry.highlights.length > 0 ? (
                      <ul className="mt-5 space-y-2.5 border-t border-border pt-5">
                        {entry.highlights.map((item) => (
                          <li
                            key={item}
                            className="flex gap-2.5 text-sm text-muted"
                          >
                            <span
                              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                              aria-hidden
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </article>
              </StaggerItem>
            ))}
          </div>
        </StaggerFadeIn>
      </Container>
    </section>
  );
}
