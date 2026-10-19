"use client";

import { Download, Github, Linkedin, MessageCircle } from "lucide-react";
import { games } from "@/data/games";
import { profile, socialLinks } from "@/data/profile";
import { Container } from "@/components/ui/container";
import { iconLinkStyles } from "@/components/ui/button";

const contactSocials = socialLinks.filter(
  (link) => link.label === "GitHub" || link.label === "LinkedIn"
);

const whatsappHref = profile.whatsapp
  ? `https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, "")}`
  : `mailto:${profile.email}`;

/**
 * Mobile-only (below lg): a bordered games promo card and a "Let's talk"
 * contact block, placed after the Recent work teaser. The games card is the
 * only bordered/highlighted card on the mobile home page.
 */
export function MobileGamesContact() {
  return (
    <div className="lg:hidden">
      {/* Games card: the only bordered, highlighted card on the page. */}
      <Container className="pb-8">
        <div className="rounded-2xl border border-accent bg-accent/5 p-5">
          <h2 className="font-display text-[22px] text-foreground">
            Learn to code by playing
          </h2>
          <p className="mt-2 text-sm text-muted">
            {games.length} short games that teach HTML, CSS, JavaScript, PHP
            and SQL, one level at a time.
          </p>
          <a
            href="/games"
            className="mt-4 flex h-12 w-full items-center justify-center rounded-full border border-accent text-sm font-medium text-accent transition-colors hover:bg-accent/10"
          >
            Play the games
          </a>
        </div>
      </Container>

      {/* Let's talk block */}
      <div className="border-t border-border">
        <Container className="py-8">
          <h2 className="font-display text-[22px] text-foreground">Let&apos;s talk</h2>
          <p className="mt-2 text-sm text-muted">
            Tell me about your project and I will get back to you.
          </p>

          <a
            href={whatsappHref}
            target={profile.whatsapp ? "_blank" : undefined}
            rel={profile.whatsapp ? "noreferrer noopener" : undefined}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground shadow-glow transition-all hover:brightness-110"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
            Message on WhatsApp
          </a>

          <a
            href={`mailto:${profile.email}`}
            className="mt-1 flex min-h-11 items-center justify-center text-sm font-medium text-accent transition-colors hover:text-accent/80"
          >
            Send an email
          </a>

          <div className="mt-4 flex items-center justify-center gap-3">
            {contactSocials.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noreferrer noopener"
                className={iconLinkStyles("h-11 w-11")}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </a>
            ))}
            <a
              href={profile.resumeSrc}
              aria-label="Download Resume"
              download
              className={iconLinkStyles("h-11 w-11")}
            >
              <Download className="h-4 w-4" strokeWidth={1.75} />
            </a>
          </div>
        </Container>
      </div>
    </div>
  );
}
