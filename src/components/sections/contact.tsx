"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Download, Github, Linkedin, Mail, MapPin, Loader2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { buttonStyles, iconLinkStyles } from "@/components/ui/button";
import { profile, socialLinks } from "@/data/profile";
import { FadeIn } from "@/components/animations/fade-in";
import { StaggerFadeIn, StaggerItem } from "@/components/animations/stagger-fade-in";
import { cn } from "@/lib/utils";

type FormState = "idle" | "submitting" | "mailto-ready";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export function Contact() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [formState, setFormState] = useState<FormState>("idle");
  const [mailtoUrl, setMailtoUrl] = useState("");

  const validate = (): boolean => {
    const tempErrors: FormErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      tempErrors.name = "Name is required.";
      isValid = false;
    }

    if (!formData.email.trim()) {
      tempErrors.email = "Email is required.";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      tempErrors.email = "Please enter a valid email address.";
      isValid = false;
    }

    if (!formData.subject.trim()) {
      tempErrors.subject = "Subject is required.";
      isValid = false;
    }

    if (!formData.message.trim()) {
      tempErrors.message = "Message is required.";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error as the user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setFormState("submitting");

    // Simulate short delay for a premium loading state interaction
    setTimeout(() => {
      const subjectEncoded = encodeURIComponent(formData.subject);
      const bodyEncoded = encodeURIComponent(
        `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
      );
      const url = `mailto:${profile.email}?subject=${subjectEncoded}&body=${bodyEncoded}`;
      
      setMailtoUrl(url);
      setFormState("mailto-ready");
      
      // Attempt to launch the default mail client automatically
      window.location.href = url;
    }, 900);
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
    setErrors({});
    setFormState("idle");
    setMailtoUrl("");
  };

  const contactSocials = socialLinks.filter(
    (link) => link.label === "GitHub" || link.label === "LinkedIn"
  );

  return (
    <section
      id="contact"
      className="scroll-mt-20 border-b border-border bg-noise relative overflow-hidden py-24"
    >
      {/* Background glow orb */}
      <div
        aria-hidden="true"
        className="glow-orb -left-28 top-10 h-72 w-72 bg-primary/10"
      />
      <div
        aria-hidden="true"
        className="glow-orb -right-20 bottom-10 h-64 w-64 bg-accent/10"
      />

      <Container className="relative">
        <FadeIn>
          <SectionHeading
            eyebrow="Get in Touch"
            title="Contact"
            description="Reach out directly for freelance opportunities, project collaborations, or teaching inquiries."
          />
        </FadeIn>

        <div className="mt-14 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          {/* Left Column: Direct Info */}
          <FadeIn delay={0.05}>
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="font-display text-2xl font-semibold text-foreground md:text-3xl">
                  Let&apos;s Build Something Together
                </h3>
                <p className="max-w-md text-sm leading-relaxed text-muted">
                  I am available for web development contracts, cross-platform mobile apps, or local academic engagements in Lahore. Let&apos;s collaborate to build clean codebases and performant solutions.
                </p>
              </div>

              {/* Status Badge */}
              <div className="text-mono inline-flex items-center gap-2 rounded-full border border-border bg-background-secondary px-3 py-1 text-xs text-muted">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                {profile.status}
              </div>

              {/* Contact details */}
              <div className="space-y-4 pt-4">
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-3.5 group text-sm text-muted hover:text-foreground transition-colors"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted transition-colors group-hover:border-primary/40 group-hover:text-primary">
                    <Mail className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="text-[0.65rem] text-mono uppercase tracking-wider text-muted/60">
                      Email
                    </p>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                </a>

                <div className="flex items-center gap-3.5 text-sm text-muted">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted">
                    <MapPin className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="text-[0.65rem] text-mono uppercase tracking-wider text-muted/60">
                      Location
                    </p>
                    <p className="font-medium text-foreground">{profile.location}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Resume & Socials */}
              <div className="flex flex-wrap items-center gap-4 border-t border-border pt-8">
                {/* 
                  TODO: Place real PDF resume at /public/resume/maaz-arif-resume.pdf 
                  to allow users to download it.
                */}
                <a
                  href={profile.resumeSrc}
                  download
                  className={buttonStyles({ variant: "outline", size: "sm" })}
                >
                  <Download className="h-4 w-4" strokeWidth={1.75} />
                  Download Resume
                </a>

                <div className="flex items-center gap-2">
                  {contactSocials.map(({ label, href, icon: Icon }) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={iconLinkStyles()}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Right Column: Contact Form */}
          <FadeIn delay={0.1}>
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-card">
              {formState === "mailto-ready" ? (
                <div className="text-center py-8 space-y-6">
                  <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
                    <Mail className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-display text-lg font-semibold text-foreground">
                      Email Prepared
                    </h4>
                    <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed">
                      Your default mail application has been triggered. Click below if you need to manually open or resend the draft.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 max-w-xs mx-auto">
                    <a
                      href={mailtoUrl}
                      className={buttonStyles({ size: "md" })}
                    >
                      Open Email App
                      <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                    </a>
                    <button
                      type="button"
                      onClick={handleReset}
                      className={buttonStyles({ variant: "outline", size: "md" })}
                    >
                      Write Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div className="grid gap-5 sm:grid-cols-2">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                        Name <span className="text-primary">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        disabled={formState === "submitting"}
                        value={formData.name}
                        onChange={handleInputChange}
                        className={cn(
                          "w-full rounded-xl border border-border bg-background-secondary px-4 py-3 text-sm text-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-50",
                          errors.name && "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500"
                        )}
                        placeholder="John Doe"
                      />
                      {errors.name && (
                        <p className="text-xs text-red-500" role="alert">{errors.name}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                        Email <span className="text-primary">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        disabled={formState === "submitting"}
                        value={formData.email}
                        onChange={handleInputChange}
                        className={cn(
                          "w-full rounded-xl border border-border bg-background-secondary px-4 py-3 text-sm text-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-50",
                          errors.email && "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500"
                        )}
                        placeholder="john@example.com"
                      />
                      {errors.email && (
                        <p className="text-xs text-red-500" role="alert">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-1.5">
                    <label htmlFor="subject" className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                      Subject <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      disabled={formState === "submitting"}
                      value={formData.subject}
                      onChange={handleInputChange}
                      className={cn(
                        "w-full rounded-xl border border-border bg-background-secondary px-4 py-3 text-sm text-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-50",
                        errors.subject && "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500"
                      )}
                      placeholder="Project details or inquiry description"
                    />
                    {errors.subject && (
                      <p className="text-xs text-red-500" role="alert">{errors.subject}</p>
                    )}
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label htmlFor="message" className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                      Message <span className="text-primary">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      disabled={formState === "submitting"}
                      value={formData.message}
                      onChange={handleInputChange}
                      className={cn(
                        "w-full resize-none rounded-xl border border-border bg-background-secondary px-4 py-3 text-sm text-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-50",
                        errors.message && "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500"
                      )}
                      placeholder="Hi Maaz, I'd like to discuss a freelance web project..."
                    />
                    {errors.message && (
                      <p className="text-xs text-red-500" role="alert">{errors.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={formState === "submitting"}
                      className={cn(
                        "w-full justify-center",
                        buttonStyles({ size: "md" })
                      )}
                    >
                      {formState === "submitting" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Preparing Draft...
                        </>
                      ) : (
                        <>
                          Send Message
                          <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
