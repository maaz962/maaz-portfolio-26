"use client";

import { Award, BookOpen, Code2, GraduationCap, Quote, Users } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { FadeIn } from "@/components/animations/fade-in";
import { StaggerFadeIn, StaggerItem } from "@/components/animations/stagger-fade-in";

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="scroll-mt-20 border-b border-border py-24 bg-background-secondary/20"
    >
      <Container>
        <FadeIn>
          <SectionHeading
            eyebrow="Trust"
            title="Trust & Qualifications"
            description="Verified experience, academic base, and community contributions that back up my services."
          />
        </FadeIn>

        <div className="mt-14 grid gap-8 lg:grid-cols-2 lg:items-stretch">
          {/* Left Column: Why Work With Me (Real Trust Signals) */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              <h3 className="font-display text-xl font-semibold text-foreground">
                Why work with me
              </h3>
              <p className="mt-2 text-sm text-muted">
                My approach blends formal computer science education with active leadership, teaching, and real world project builds.
              </p>
            </div>

            <StaggerFadeIn className="grid gap-4 sm:grid-cols-2">
              <StaggerItem>
                <div className="rounded-xl border border-border bg-card p-5 shadow-card transition-colors hover:border-primary/20">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/5 text-primary">
                    <Users className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  </div>
                  <h4 className="mt-4 text-sm font-semibold text-foreground">
                    Club Leadership
                  </h4>
                  <p className="mt-1 text-xs text-muted leading-relaxed">
                    Senior Vice President at UAF Freelancing Club. Managed operations and coordinated flood relief and campus walks.
                  </p>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="rounded-xl border border-border bg-card p-5 shadow-card transition-colors hover:border-primary/20">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/25 bg-accent/5 text-accent">
                    <BookOpen className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  </div>
                  <h4 className="mt-4 text-sm font-semibold text-foreground">
                    Technical Teaching
                  </h4>
                  <p className="mt-1 text-xs text-muted leading-relaxed">
                    Instructed a Basic Web Development course through the freelancing club, helping students learn code fundamentals.
                  </p>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="rounded-xl border border-border bg-card p-5 shadow-card transition-colors hover:border-primary/20">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/5 text-primary">
                    <Code2 className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  </div>
                  <h4 className="mt-4 text-sm font-semibold text-foreground">
                    Verified Builds
                  </h4>
                  <p className="mt-1 text-xs text-muted leading-relaxed">
                    Contributed to the STO UAF website and developed stand alone mobile applications like Cyber Scam Checker.
                  </p>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="rounded-xl border border-border bg-card p-5 shadow-card transition-colors hover:border-primary/20">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/25 bg-accent/5 text-accent">
                    <GraduationCap className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  </div>
                  <h4 className="mt-4 text-sm font-semibold text-foreground">
                    Academic Base
                  </h4>
                  <p className="mt-1 text-xs text-muted leading-relaxed">
                    BS Computer Science candidate at the University of Agriculture Faisalabad (2023 – 2027).
                  </p>
                </div>
              </StaggerItem>
            </StaggerFadeIn>
          </div>

          {/* Right Column: Verified Testimonial Placeholder */}
          <FadeIn delay={0.1} className="flex h-full flex-col">
            <div className="group relative flex flex-1 flex-col justify-between rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center shadow-card transition-all duration-300 hover:border-primary/30">
              <div aria-hidden="true" className="bg-grid absolute inset-0 opacity-10" />

              <div className="relative z-10 flex flex-1 flex-col items-center justify-center py-6">
                <Quote className="h-10 w-10 text-muted opacity-30 group-hover:text-primary/40 transition-colors" strokeWidth={1.25} />
                <h4 className="mt-5 font-display text-lg font-semibold text-foreground/90">
                  Testimonials & Feedback
                </h4>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
                  Feedback from clients and collaborators will appear here as I collect verified testimonials.
                </p>
                <p className="mt-2 text-xs text-muted/60 italic leading-relaxed">
                  {"// committed to building project records with full integrity"}
                </p>
              </div>

              <div className="relative z-10 border-t border-border pt-6 text-left">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background-secondary">
                    <Award className="h-5 w-5 text-muted/80" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-foreground">
                      Client & Collaborator Reviews
                    </h5>
                    <p className="text-[0.65rem] text-muted tracking-wider uppercase">
                      Pending Collection
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
