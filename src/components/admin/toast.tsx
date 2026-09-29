"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error";

interface ToastItem {
  id: number;
  variant: ToastVariant;
  message: string;
}

/** Success fades out sooner than errors, which need longer to be read. */
const DURATION: Record<ToastVariant, number> = { success: 4000, error: 8000 };
const MAX_VISIBLE = 3;

interface ToastContextValue {
  notify: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Transient admin feedback.
 *
 * Replaces the two bare `<p>` tags that used to sit at the very top of a long
 * scrolling page: acting on a row six screens down produced a notice above the
 * fold, effectively invisible. Toasts are fixed to the viewport instead.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, variant, message }].slice(-MAX_VISIBLE));
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), DURATION[variant])
      );
    },
    [dismiss]
  );

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[calc(100vw-2rem)] max-w-sm flex-col items-end gap-2 sm:w-full"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a <ToastProvider>");
  }
  return ctx;
}

function Toast({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const isError = toast.variant === "error";
  const Icon = isError ? AlertCircle : CheckCircle2;

  return (
    <motion.div
      role={isError ? "alert" : "status"}
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={cn(
        "pointer-events-auto flex w-full items-start gap-3 rounded-2xl border p-4 shadow-card backdrop-blur",
        isError
          ? "border-red-500/25 bg-red-500/10"
          : "border-emerald-500/25 bg-emerald-500/10"
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0",
          isError ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
        )}
      />
      <p
        className={cn(
          "flex-1 text-sm font-medium",
          isError ? "text-red-700 dark:text-red-300" : "text-emerald-800 dark:text-emerald-300"
        )}
      >
        {toast.message}
      </p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="-m-1 shrink-0 rounded-full p-1 text-current opacity-60 transition-opacity hover:opacity-100"
      >
        <X className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </motion.div>
  );
}
