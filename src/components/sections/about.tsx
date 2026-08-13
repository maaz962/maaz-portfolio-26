import { aboutContent } from "@/data/about";
import { profile } from "@/data/profile";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { TerminalWindow } from "@/components/ui/terminal-window";
import { FadeIn } from "@/components/animations/fade-in";

export function About() {
  return (
    <section
      id="about"
      className="scroll-mt-20 border-b border-border bg-noise relative overflow-hidden py-24"
    >
      <div
        aria-hidden
        className="glow-orb -left-24 top-20 h-64 w-64 bg-primary/20"
      />
      <div
        aria-hidden
        className="glow-orb -right-16 bottom-0 h-48 w-48 bg-accent/15"
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
              <p className="max-w-prose text-lg text-foreground/90">
                {aboutContent.intro}
              </p>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="text-lg text-foreground">
                    {aboutContent.identity.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted">
                    {aboutContent.identity.body}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg text-foreground">
                    {aboutContent.learning.title}
                  </h3>
                  <ul className="space-y-1.5 text-sm text-muted">
                    {aboutContent.learning.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="text-primary" aria-hidden>
                          →
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background-secondary/50 p-6">
                <h3 className="text-lg text-foreground">
                  {aboutContent.builds.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {aboutContent.builds.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm text-muted"
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
            </div>
          </FadeIn>

          <FadeIn delay={0.12} offset={12}>
            <div className="space-y-6">
              <TerminalWindow title="~/about/identity.json">
                <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs leading-relaxed sm:text-sm">
                  {`{
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
}`}
                </pre>
              </TerminalWindow>

              <div>
                <p className="text-mono text-xs uppercase tracking-widest text-primary">
                  Main areas
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {aboutContent.focusAreas.map((area) => (
                    <li
                      key={area}
                      className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground/90"
                    >
                      {area}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-dashed border-border/80 px-5 py-4">
                <h3 className="text-sm font-medium text-foreground">
                  {aboutContent.aside.title}
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-muted">
                  {aboutContent.aside.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
