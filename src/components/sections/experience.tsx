"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { experience } from "@/data/experience";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Chip } from "@/components/ui/chip";
import { FadeIn } from "@/components/animations/fade-in";
import {
  StaggerFadeIn,
  StaggerItem,
} from "@/components/animations/stagger-fade-in";
import { cn } from "@/lib/utils";

function HighlightList({ items, itemId }: { items: string[]; itemId: string }) {
  const [showAll, setShowAll] = useState(false);
  const collapsible = items.length > 4;
  const visible = collapsible && !showAll ? items.slice(0, 4) : items;

  return (
    <>
      <ul
        id={itemId}
        className="mt-5 space-y-2.5 border-t border-border pt-5"
      >
        {visible.map((item) => (
          <li key={item} className="flex gap-2.5 text-[15px] text-muted">
            <span
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
              aria-hidden
            />
            {item}
          </li>
        ))}
      </ul>
      {collapsible ? (
        <button
          type="button"
          aria-expanded={showAll}
          aria-controls={itemId}
          onClick={() => setShowAll((value) => !value)}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground/80 transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none"
        >
          {showAll ? "Show less" : "Show all"}
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform",
              showAll && "rotate-180"
            )}
            strokeWidth={2}
          />
        </button>
      ) : null}
    </>
  );
}

export function Experience() {
  return (
    <Section id="experience" aria-label="Experience">
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
            className="absolute bottom-2 left-[1.125rem] top-2 w-px bg-border md:left-6"
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
                    <p className="text-xs uppercase tracking-widest text-primary">
                      {entry.period}
                    </p>
                    {entry.featured ? (
                      <Chip
                        variant="primary"
                        className="mt-2 uppercase tracking-wide"
                      >
                        Current
                      </Chip>
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
                        <p className="mt-1 text-[15px] text-muted">
                          {entry.affiliation}
                        </p>
                      ) : null}
                    </header>

                    {entry.summary ? (
                      <p className="mt-4 text-[15px] leading-relaxed text-muted">
                        {entry.summary}
                      </p>
                    ) : null}

                    {entry.highlights && entry.highlights.length > 0 ? (
                      <HighlightList
                        items={entry.highlights}
                        itemId={`experience-highlights-${index}`}
                      />
                    ) : null}
                  </div>
                </article>
              </StaggerItem>
            ))}
          </div>
        </StaggerFadeIn>
      </Container>
    </Section>
  );
}