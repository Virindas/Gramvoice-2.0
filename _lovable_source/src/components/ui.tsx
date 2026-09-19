import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { Loader2, X, Check, AlertCircle, Mic, Square, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { LANGUAGES, type Status } from "@/lib/mock-data";
import { useApi, useStore } from "@/lib/store";

/* ----------------------------- Button ----------------------------- */

type Variant = "primary" | "secondary" | "text" | "danger" | "admin" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  full?: boolean;
  icon?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-soft disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none",
  admin:
    "bg-admin text-admin-foreground hover:bg-admin/90 shadow-soft disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none",
  outline:
    "border-2 border-primary/30 bg-card text-primary hover:bg-primary-soft disabled:opacity-50",
  text: "text-primary hover:bg-primary-soft disabled:opacity-50",
  danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50",
};

export function Button({
  variant = "primary",
  loading,
  full,
  icon,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-base font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed",
        variants[variant],
        full && "w-full",
        className,
      )}
    >
      {loading ? <Loader2 className="size-5 animate-spin" /> : icon}
      {children}
    </button>
  );
}

/* ----------------------------- Field wrapper ----------------------------- */

function Field({
  label,
  error,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-base font-semibold text-foreground">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-sm text-muted-foreground">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1.5 text-sm font-medium text-destructive">
          <AlertCircle className="size-4 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

const control =
  "w-full min-h-12 rounded-xl border-2 bg-card px-4 py-2.5 text-base text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none transition-colors";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, ...rest },
  ref,
) {
  const uid = useId();
  return (
    <Field label={label} error={error} hint={hint} htmlFor={uid}>
      <input
        id={uid}
        ref={ref}
        {...rest}
        className={cn(control, error ? "border-destructive" : "border-input", className)}
      />
    </Field>
  );
});

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
}

export function TextArea({ label, error, hint, className, ...rest }: TextAreaProps) {
  const uid = useId();
  return (
    <Field label={label} error={error} hint={hint} htmlFor={uid}>
      <textarea
        id={uid}
        rows={5}
        {...rest}
        className={cn(control, error ? "border-destructive" : "border-input", className)}
      />
    </Field>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
  options: string[];
  placeholder?: string;
}

export function Select({
  label,
  error,
  hint,
  options,
  placeholder,
  className,
  ...rest
}: SelectProps) {
  const uid = useId();
  return (
    <Field label={label} error={error} hint={hint} htmlFor={uid}>
      <select
        id={uid}
        {...rest}
        className={cn(control, error ? "border-destructive" : "border-input", className)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </Field>
  );
}

/* ----------------------------- PinInput ----------------------------- */

export function PinInput({
  label,
  value,
  onChange,
  error,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | undefined;
  hint?: string | undefined;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = [0, 1, 2, 3].map((i) => value[i] ?? "");

  const set = (i: number, d: string) => {
    const clean = d.replace(/\D/g, "").slice(-1);
    const next = digits.map((x, idx) => (idx === i ? clean : x)).join("");
    onChange(next.replace(/\s/g, ""));
    if (clean) refs.current[i + 1]?.focus();
  };

  return (
    <div className="space-y-1.5">
      <span className="block text-base font-semibold text-foreground">{label}</span>
      <div className="flex gap-3">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={d}
            inputMode="numeric"
            aria-label={`${label} digit ${i + 1}`}
            type="password"
            onChange={(e) => set(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !digits[i]) refs.current[i - 1]?.focus();
            }}
            className={cn(
              "size-14 rounded-xl border-2 bg-card text-center text-2xl font-bold focus:border-primary focus:outline-none",
              error ? "border-destructive" : "border-input",
            )}
          />
        ))}
      </div>
      {hint && !error && <p className="text-sm text-muted-foreground">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1.5 text-sm font-medium text-destructive">
          <AlertCircle className="size-4" /> {error}
        </p>
      )}
    </div>
  );
}

/* ----------------------------- Card ----------------------------- */

export function Card({
  className,
  children,
  elevated,
  ...rest
}: { elevated?: boolean } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={cn(
        "rounded-2xl border border-border bg-card p-5",
        elevated && "shadow-soft",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ----------------------------- StatusBadge ----------------------------- */

const statusStyles: Record<Status, string> = {
  "Under Review": "bg-review-soft text-review",
  "In Progress": "bg-progress-soft text-progress",
  Completed: "bg-completed-soft text-completed",
  Rejected: "bg-rejected-soft text-rejected",
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold whitespace-nowrap",
        statusStyles[status],
        className,
      )}
    >
      <span className="size-2 rounded-full bg-current" />
      {status}
    </span>
  );
}

/* ----------------------------- Spinner / EmptyState ----------------------------- */

export function LoadingSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-muted-foreground">
      <Loader2 className="size-6 animate-spin text-primary" />
      <span className="text-base font-medium">{label}</span>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-border bg-card/60 px-6 py-14 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary-soft text-primary">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-base text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ----------------------------- Alert ----------------------------- */

export function Alert({ tone, children }: { tone: "success" | "error" | "info"; children: ReactNode }) {
  const tones = {
    success: "bg-completed-soft text-completed",
    error: "bg-rejected-soft text-rejected",
    info: "bg-primary-soft text-accent-foreground",
  } as const;
  return (
    <div
      role="status"
      className={cn("flex items-start gap-2 rounded-xl px-4 py-3 text-base font-medium", tones[tone])}
    >
      {tone === "success" ? (
        <Check className="mt-0.5 size-5 shrink-0" />
      ) : (
        <AlertCircle className="mt-0.5 size-5 shrink-0" />
      )}
      <span>{children}</span>
    </div>
  );
}

/* ----------------------------- Toast ----------------------------- */

interface ToastItem {
  id: number;
  message: string;
  tone: "success" | "error";
}
const ToastContext = createContext<(message: string, tone?: "success" | "error") => void>(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = (message: string, tone: "success" | "error" = "success") => {
    const t = { id: Date.now() + Math.random(), message, tone };
    setItems((p) => [...p, t]);
    setTimeout(() => setItems((p) => p.filter((x) => x.id !== t.id)), 3200);
  };
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 px-4">
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-center gap-2 rounded-xl px-5 py-3 text-base font-semibold shadow-lift",
              t.tone === "success"
                ? "bg-primary text-primary-foreground"
                : "bg-destructive text-destructive-foreground",
            )}
          >
            {t.tone === "success" ? <Check className="size-5" /> : <AlertCircle className="size-5" />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ----------------------------- Modal ----------------------------- */

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card p-6 shadow-lift sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex size-12 items-center justify-center rounded-xl hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ----------------------------- ChatBubble ----------------------------- */

export function ChatBubble({ from, text }: { from: "bot" | "user"; text: string }) {
  return (
    <div className={cn("flex", from === "user" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-base",
          from === "user"
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm bg-secondary-soft text-foreground",
        )}
      >
        {text}
      </div>
    </div>
  );
}

/* ----------------------------- LanguageSwitcher ----------------------------- */

export function LanguageSwitcher({ className }: { className?: string }) {
  const { db } = useStore();
  const api = useApi();
  return (
    <label
      className={cn(
        "inline-flex min-h-12 items-center gap-2 rounded-xl border border-border bg-card px-3",
        className,
      )}
    >
      <Globe className="size-5 text-primary" />
      <span className="sr-only">Language</span>
      <select
        value={db.language}
        onChange={(e) => api.setLanguage(e.target.value as (typeof LANGUAGES)[number])}
        className="bg-transparent text-base font-semibold focus:outline-none"
      >
        {LANGUAGES.map((l) => (
          <option key={l}>{l}</option>
        ))}
      </select>
    </label>
  );
}

/* ----------------------------- VoiceRecorderControl ----------------------------- */

type VoicePhase = "idle" | "recording" | "transcribing" | "done";

const SAMPLE_TRANSCRIPT =
  "The hand pump near the school has been leaking for the past week and water is being wasted. Please send someone to repair it.";

export function VoiceRecorderControl({
  phase,
  setPhase,
  onTranscript,
}: {
  phase: VoicePhase;
  setPhase: (p: VoicePhase) => void;
  onTranscript: (text: string) => void;
}) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (phase !== "recording") return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const start = () => {
    setSeconds(0);
    setPhase("recording");
  };
  const stop = () => {
    setPhase("transcribing");
    setTimeout(() => {
      onTranscript(SAMPLE_TRANSCRIPT);
      setPhase("done");
    }, 1800);
  };

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl bg-primary-soft/60 px-6 py-8">
      {phase === "transcribing" ? (
        <>
          <Loader2 className="size-12 animate-spin text-primary" />
          <p className="text-base font-semibold text-accent-foreground">Transcribing…</p>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={phase === "recording" ? stop : start}
            aria-label={phase === "recording" ? "Stop recording" : "Start recording"}
            className={cn(
              "flex size-24 items-center justify-center rounded-full text-primary-foreground shadow-lift transition-transform active:scale-95",
              phase === "recording" ? "animate-pulse bg-destructive" : "bg-primary",
            )}
          >
            {phase === "recording" ? <Square className="size-9" /> : <Mic className="size-10" />}
          </button>
          <p className="text-base font-semibold text-accent-foreground">
            {phase === "recording"
              ? `Recording… ${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`
              : phase === "done"
                ? "Recorded. Edit the text below if needed."
                : "Tap the microphone and speak your complaint"}
          </p>
        </>
      )}
    </div>
  );
}
