"use client";

import { ArrowRight } from "lucide-react";
import { services } from "@/data/services";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { buttonStyles } from "@/components/ui/button";
import { FadeIn } from "@/components/animations/fade-in";
import { StaggerFadeIn, StaggerItem } from "@/components/animations/stagger-fade-in";
import { cn } from "@/lib/utils";

export function Services() {
  return (
    <section
      id="services"
      className="scroll-mt-20 border-b border-border bg-noise relative overflow-hidden py-24"
    >
      {/* Background Orbs */}
      <div
        aria-hidden="true"
        className="glow-orb -left-20 bottom-10 h-64 w-64 bg-accent/10"
      />
      <div
        aria-hidden="true"
        className="glow-orb -right-10 top-20 h-56 w-56 bg-primary/15"
      />

      <Container className="relative">
        <FadeIn>
          <SectionHeading
            eyebrow="Solutions"
            title="Services"
            description="High quality web, mobile, and maintenance solutions tailored to your project's specific requirements."
          />
        </FadeIn>

        {/* Dynamic Grid Layout */}
        <StaggerFadeIn className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            const isFeatured = service.featured;

            return (
              <StaggerItem
                key={service.slug}
                className={cn(
                  "h-full",
                  isFeatured ? "md:col-span-2" : "md:col-span-1"
                )}
              >
                <article
                  className={cn(
                    "group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-8 shadow-card transition-all duration-300 hover:border-primary/35 hover:shadow-glow",
                    isFeatured && "border-primary/20 bg-gradient-to-br from-card to-background-secondary/30"
                  )}
                >
                  <div>
                    {/* Icon */}
                    <span
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-background-secondary text-muted transition-colors group-hover:border-primary/40 group-hover:text-primary",
                        isFeatured && "border-primary/30 bg-primary/5 text-primary"
                      )}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>

                    {/* Title */}
                    <h3
                      className={cn(
                        "mt-5 text-xl font-semibold text-foreground transition-colors group-hover:text-primary",
                        isFeatured && "text-xl md:text-2xl"
                      )}
                    >
                      {service.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-3 text-sm leading-relaxed text-muted">
                      {service.description}
                    </p>
                  </div>

                  <div>
                    {/* Technologies */}
                    <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="Technologies used">
                      {service.technologies.map((tech) => (
                        <li
                          key={tech}
                          className="text-mono rounded-full border border-border bg-background-secondary px-2.5 py-0.5 text-[0.65rem] text-foreground/85"
                        >
                          {tech}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <div className="mt-6">
                      <a
                        href="#contact"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline hover:text-primary/80"
                      >
                        Inquire about this
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" strokeWidth={2} />
                      </a>
                    </div>
                  </div>
                </article>
              </StaggerItem>
            );
          })}
        </StaggerFadeIn>

        {/* Services CTA Box */}
        <FadeIn delay={0.1}>
          <div className="relative mt-20 overflow-hidden rounded-2xl border border-border bg-background-secondary/40 p-8 text-center md:p-12">
            <div aria-hidden="true" className="bg-grid absolute inset-0 opacity-15" />
            <div
              aria-hidden="true"
              className="glow-orb -bottom-16 left-1/2 -translate-x-1/2 h-36 w-72 bg-primary/10"
            />
            <div className="relative z-10 mx-auto max-w-xl">
              <h3 className="text-2xl font-semibold text-foreground md:text-3xl">
                Have a project in mind?
              </h3>
              <p className="mt-3 text-sm md:text-base text-muted">
                Let&apos;s discuss how we can work together to turn your ideas into functional, clean, and reliable applications.
              </p>
              <div className="mt-8">
                <a
                  href="#contact"
                  className={buttonStyles({ size: "lg" })}
                >
                  Let&apos;s Work Together
                  <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                </a>
              </div>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
