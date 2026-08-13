import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { FadeIn } from "@/components/animations/fade-in";

interface ComingSoonSectionProps {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
}

/**
 * Placeholder for a section that is intentionally not built yet in this
 * foundation pass (About / Skills / Projects / Experience / Contact).
 * Keeps nav anchors working and shows the type/spacing system in context.
 * Replace each usage in page.tsx with a real section component later.
 */
export function ComingSoonSection({
  id,
  eyebrow,
  title,
  description,
}: ComingSoonSectionProps) {
  return (
    <section id={id} className="scroll-mt-20 border-b border-border py-24">
      <Container>
        <FadeIn>
          <SectionHeading eyebrow={eyebrow} title={title} description={description} />
          <p className="text-mono mt-8 text-xs text-muted">
            {"// section content coming soon"}
          </p>
        </FadeIn>
      </Container>
    </section>
  );
}
