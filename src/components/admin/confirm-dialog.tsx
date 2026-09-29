"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * A confirmation dialog for actions that are not destructive enough to justify
 * the typed-confirmation guard, but that would be careless to fire on a single
 * click.
 *
 * The browser's `window.confirm` is not used anywhere in the admin panel. It is
 * dismissed by reflex, it cannot be styled, it is suppressed entirely in some
 * embedded browsers, and on mobile it renders as a browser sheet that looks
 * nothing like the rest of the panel.
 *
 * Permanent account deletion does NOT use this. That action has a typed guard
 * in `danger-zone.tsx` instead, because "delete forever" needs the user to
 * retype the exact username before anything happens. This component is for the
 * tier below that: reversible, obvious in intent, and not worth a second field.
 *
 * Accessibility: renders as a real `role="dialog"` with `aria-modal`, labelled
 * by its own title, closes on Escape and on backdrop click, and moves focus to
 * the confirm button on open so Enter does the expected thing.
 */
export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  /** What will happen, in plain words. Shown as the dialog's description. */
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** `danger` paints the confirm button with the destructive variant. */
  tone?: "default" | "danger";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) {
        event.preventDefault();
        onCancel();
        return;
      }
      // Keep Tab inside the dialog: it is modal, so focus must not wander to the
      // page behind it while the overlay is up.
      if (event.key === "Tab") {
        event.preventDefault();
        if (busy) return;
        onCancel();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cancel"
        tabIndex={-1}
        onClick={() => !busy && onCancel()}
        className="absolute inset-0 h-full w-full cursor-default bg-foreground/40 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-card"
      >
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              tone === "danger" ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-primary/10 text-primary"
            )}
          >
            <AlertTriangle className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <h2 id="confirm-dialog-title" className="text-base font-semibold text-foreground">
              {title}
            </h2>
            <p id="confirm-dialog-description" className="mt-1.5 text-sm text-muted">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className={buttonStyles({ variant: "outline", size: "sm" })}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={buttonStyles({
              variant: tone === "danger" ? "danger" : "primary",
              size: "sm",
            })}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Small state helper so a caller can drive a `ConfirmDialog` from one
 * `useState` instead of hand-rolling `open`/`busy` pairs at every call site.
 */
export function useConfirmDialog() {
  const [request, setRequest] = useState<{
    title: string;
    description: string;
    confirmLabel?: string;
    tone?: "default" | "danger";
    onConfirm: () => void | Promise<void>;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  const confirm = (next: typeof request) => setRequest(next);
  const close = () => {
    if (busy) return;
    setRequest(null);
  };

  const dialogProps = request
    ? ({
        open: true,
        title: request.title,
        description: request.description,
        confirmLabel: request.confirmLabel,
        tone: request.tone,
        busy,
        onCancel: close,
        onConfirm: async () => {
          setBusy(true);
          try {
            await request.onConfirm();
          } finally {
            setBusy(false);
            setRequest(null);
          }
        },
      } as const)
    : null;

  return { confirm, dialogProps };
}
