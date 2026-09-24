"use client";

import type { SkillCategory, SkillProficiency } from "@/types";
import {
  proficiencyLabels,
  skillCategoryMeta,
  skillCategoryOrder,
  skills,
} from "@/data/skills";
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

function skillsByCategory(category: SkillCategory) {
  return skills.filter((skill) => skill.category === category);
}

const proficiencyDot: Record<SkillProficiency, string> = {
  development: "bg-primary",
  familiar: "bg-secondary",
  learning: "bg-muted",
};

const legendItems: {
  key: SkillProficiency;
  label: string;
  description: string;
}[] = [
  { key: "development", label: "Proficient", description: "Used daily on real projects" },
  { key: "familiar", label: "Familiar", description: "Hands-on experience, comfortable using it" },
  { key: "learning", label: "Learning", description: "Studying and practicing now" },
];

export function Skills() {
  return (
    <Section id="skills" aria-label="Skills">
      <Container>
        <FadeIn>
          <SectionHeading
            eyebrow="Toolbox"
            title="Skills"
            description="Technologies I work with, grouped honestly by how I use them day to day."
          />
        </FadeIn>

        <FadeIn delay={0.05}>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs text-muted">
            {legendItems.map(({ key, label, description }) => (
              <span key={key} className="inline-flex items-center gap-2">
                <span
                  aria-hidden
                  className={cn("h-1.5 w-1.5 rounded-full", proficiencyDot[key])}
                />
                <span className="font-medium text-foreground">{label}</span>
                <span>{description}</span>
              </span>
            ))}
          </div>
        </FadeIn>

        <div className="mt-12 space-y-12">
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
                  </div>

                  <StaggerFadeIn className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((skill) => (
                      <StaggerItem key={skill.name}>
                        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-card transition-colors hover:border-primary/30">
                          <span className="text-sm font-medium text-foreground">
                            {skill.name}
                          </span>
                          <Chip className="shrink-0 gap-1.5 uppercase tracking-wide">
                            <span
                              aria-hidden
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                proficiencyDot[skill.proficiency]
                              )}
                            />
                            {proficiencyLabels[skill.proficiency]}
                          </Chip>
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
    </Section>
  );
}