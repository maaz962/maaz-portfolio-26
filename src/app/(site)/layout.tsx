import { Footer } from "@/components/layout/footer";
import { AIAssistant } from "@/components/ui/ai-assistant";
import { AnalyticsGate } from "@/components/tracking/analytics-gate";

/**
 * Public site chrome.
 *
 * Everything in the `(site)` group -- the home page and /games -- is a
 * visitor-facing surface and gets the footer, the floating AI assistant and
 * the consent-gated analytics tracker.
 *
 * This is the ONLY place those three components are mounted. They are
 * intentionally absent from the root layout so that routes outside this group
 * (/admin and /admin/login) never render them: a route group changes the URL
 * path, not the layout tree, so the group has to sit *below* the root layout
 * for the separation to mean anything.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex flex-1 flex-col">{children}</div>
      <Footer />
      <AIAssistant />
      <AnalyticsGate />
    </>
  );
}
