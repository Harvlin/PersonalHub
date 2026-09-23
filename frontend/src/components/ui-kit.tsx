import { useEffect, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- Button ---------- */

type Variant = "solid" | "ghost" | "danger";

export function Button({
  variant = "ghost",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={cn(
        "focus-ink inline-flex items-center gap-1.5 rounded-[3px] px-2.5 py-1.5 text-[12.5px] font-medium transition-colors disabled:opacity-40",
        variant === "solid" && "bg-ink text-primary-foreground hover:opacity-85",
        variant === "ghost" && "hairline text-ink-secondary hover:text-ink hover:bg-accent",
        variant === "danger" && "bg-signal text-primary-foreground hover:opacity-85",
        className,
      )}
    />
  );
}

/* ---------- Inputs ---------- */

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "focus-ink hairline mono w-full rounded-[3px] bg-paper px-2.5 py-1.5 text-[12.5px] text-ink",
        className,
      )}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "focus-ink hairline mono w-full rounded-[3px] bg-paper px-2.5 py-2 text-[12.5px] leading-relaxed text-ink",
        className,
      )}
    />
  );
}

export function Field({ label, children, error }: { label: string; children: ReactNode; error?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="micro-label block">{label}</span>
      {children}
      {error ? <span className="mono block text-[11px] text-signal">{error}</span> : null}
    </label>
  );
}

/* ---------- Segmented control ---------- */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="hairline inline-flex rounded-full bg-paper p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "focus-ink rounded-full px-3 py-1 text-[12px] font-medium transition-colors",
            value === o.value ? "bg-ink text-primary-foreground" : "text-ink-secondary hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Chips ---------- */

export function Chip({
  children,
  active,
  onClick,
  className,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const Comp = onClick ? "button" : "span";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "mono hairline inline-flex items-center rounded-full px-2 py-0.5 text-[11px]",
        active ? "bg-ink text-primary-foreground" : "text-ink-secondary",
        onClick && "focus-ink hover:text-ink",
        className,
      )}
    >
      {children}
    </Comp>
  );
}

/* ---------- Cards ---------- */

export function Card({
  children,
  className,
  grain,
}: {
  children: ReactNode;
  className?: string;
  grain?: boolean;
}) {
  return (
    <section
      className={cn("hairline rounded-md", grain ? "grain" : "bg-paper", className)}
    >
      {children}
    </section>
  );
}

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("micro-label", className)}>{children}</div>;
}

export function EmptyState({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <p className="mono text-[12px] text-ink-muted">{message}</p>
      {actionLabel && onAction ? (
        <Button onClick={onAction}>{actionLabel}</Button>
      ) : null}
    </div>
  );
}

/* ---------- Modal ---------- */

export function Modal({
  open,
  onClose,
  children,
  title,
  grain,
  width = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title: string;
  grain?: boolean;
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-[12vh]">
      <div
        className="fixed inset-0 bg-[oklch(0.2_0.008_60_/_28%)]"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "hairline relative w-full rounded-md",
          width,
          grain ? "grain" : "bg-paper",
        )}
      >
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-[13px] font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="focus-ink text-ink-muted hover:text-ink">
            <X size={14} />
          </button>
        </header>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

/* ---------- Drawer ---------- */

export function Drawer({
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
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-[oklch(0.2_0.008_60_/_20%)]" onClick={onClose} aria-hidden />
      <aside
        role="dialog"
        aria-label={title}
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-border bg-paper"
      >
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-[13px] font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="focus-ink text-ink-muted hover:text-ink">
            <X size={14} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </aside>
    </div>
  );
}

/* ---------- Minimal markdown renderer (bold / italic / code / lists) ---------- */

export function Markdown({ text }: { text: string }) {
  if (!text.trim()) {
    return <p className="mono text-[12px] text-ink-muted">No description yet — click to add one.</p>;
  }
  const inline = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, '<code class="mono">$1</code>');

  const blocks = text.split(/\n{2,}/);
  return (
    <div className="space-y-2 text-[13px] leading-relaxed text-ink-secondary">
      {blocks.map((b, i) => {
        const lines = b.split("\n");
        if (lines.every((l) => /^[-*]\s+/.test(l))) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-4">
              {lines.map((l, j) => (
                <li key={j} dangerouslySetInnerHTML={{ __html: inline(l.replace(/^[-*]\s+/, "")) }} />
              ))}
            </ul>
          );
        }
        return <p key={i} dangerouslySetInnerHTML={{ __html: inline(b.replace(/\n/g, " ")) }} />;
      })}
    </div>
  );
}
