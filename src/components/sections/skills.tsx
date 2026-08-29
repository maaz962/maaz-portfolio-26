"use client";

import type { SkillCategory } from "@/types";
import {
  proficiencyLabels,
  skillCategoryMeta,
  skillCategoryOrder,
  skills,
} from "@/data/skills";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { FadeIn } from "@/components/animations/fade-in";
import {
  StaggerFadeIn,
  StaggerItem,
} from "@/components/animations/stagger-fade-in";

function skillsByCategory(category: SkillCategory) {
  return skills.filter((skill) => skill.category === category);
}

export function Skills() {
  return (
    <section
      id="skills"
      className="scroll-mt-20 border-b border-border py-24"
    >
      <Container>
        <FadeIn>
          <SectionHeading
            eyebrow="Toolbox"
            title="Skills"
            description="Technologies I work with, grouped honestly by how I use them day to day."
          />
        </FadeIn>

        <div className="mt-14 space-y-12">
          {skillCategoryOrder.map((category, groupIndex) => {
            const meta = skillCategoryMeta[category];
            const items = skillsByCategory(category);
            if (items.length === 0) return null;

            return (
              <FadeIn key={category} delay={groupIndex * 0.05}>
                <div>
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h3 className="text-xl text-foreground">{meta.label}</h3>
                      <p className="mt-1 text-sm text-muted">
                        {meta.description}
                      </p>
                    </div>
                    <span className="text-mono rounded-full border border-border bg-background-secondary px-3 py-1 text-xs text-foreground">
                      {items.length} skills
                    </span>
                  </div>

                  <StaggerFadeIn className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((skill) => (
                      <StaggerItem key={skill.name}>
                        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-card transition-colors hover:border-primary/30">
                          <span className="text-sm font-medium text-foreground">
                            {skill.name}
                          </span>
                          <span className="text-mono shrink-0 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-[0.65rem] uppercase tracking-wide text-accent">
                            {proficiencyLabels[skill.proficiency]}
                          </span>
                        </div>
                      </StaggerItem>
                    ))}
                  </StaggerFadeIn>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
