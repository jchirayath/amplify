import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { X } from "lucide-react";
import type { RxStatus } from "../lib/dates";
import { fmtAxis, fmtPower } from "../lib/rx";
import type { Eye } from "../lib/types";

export function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

type Variant = "primary" | "secondary" | "ghost" | "danger";
const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand text-on-night hover:bg-brand-dark shadow-sm disabled:bg-faint",
  secondary: "bg-panel text-ink border border-line hover:border-brand/50 hover:bg-white",
  ghost: "text-soft hover:text-ink hover:bg-tint/60",
  danger: "bg-danger text-white hover:brightness-95",
};

export function Button({ variant = "secondary", className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      {...rest}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[15px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx("rounded-2xl border border-line bg-panel shadow-card", className)}>{children}</div>;
}

export function PageHeader({ eyebrow, title, sub, actions }: { eyebrow?: string; title: ReactNode; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-semibold tracking-[0.14em] text-brand uppercase">{eyebrow}</p>}
        <h1 className="text-[28px] leading-tight font-bold tracking-tight md:text-[32px]">{title}</h1>
        {sub && <p className="mt-1 text-soft">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

const STATUS: Record<RxStatus, { label: string; cls: string }> = {
  current: { label: "Current", cls: "bg-tint text-brand-dark" },
  expiring: { label: "Expiring soon", cls: "bg-warn-bg text-warn" },
  expired: { label: "Expired", cls: "bg-danger-bg text-danger" },
};

export function StatusBadge({ status }: { status: RxStatus }) {
  const s = STATUS[status];
  return <span className={cx("inline-flex rounded-full px-2.5 py-0.5 text-[13px] font-semibold whitespace-nowrap", s.cls)}>{s.label}</span>;
}

export function Pill({ tone = "calm", children }: { tone?: "calm" | "warn" | "danger"; children: ReactNode }) {
  const cls = tone === "warn" ? "bg-warn-bg text-warn" : tone === "danger" ? "bg-danger-bg text-danger" : "bg-tint text-brand-dark";
  return <span className={cx("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[13px] font-medium whitespace-nowrap", cls)}>{children}</span>;
}

export function DemoTag({ className }: { className?: string }) {
  return <span className={cx("rounded-md border border-accent/60 bg-warn-bg px-1.5 py-0.5 text-[11px] font-bold tracking-wider text-warn uppercase", className)}>Demo</span>;
}

/** Read-only OD/OS table, aligned numbers. */
export function RxTable({ od, os, compact }: { od: Eye; os: Eye; compact?: boolean }) {
  const hasPrism = od.prism > 0 || os.prism > 0;
  const hasAdd = od.add != null || os.add != null;
  const cols = ["SPH", "CYL", "AXIS", ...(hasPrism ? ["PRISM", "BASE"] : []), ...(hasAdd ? ["ADD"] : [])];
  const cells = (e: Eye) => [fmtPower(e.sph), e.cyl === 0 ? "DS" : fmtPower(e.cyl), fmtAxis(e.axis),
    ...(hasPrism ? [e.prism ? e.prism.toFixed(2) : "–", e.base ?? "–"] : []), ...(hasAdd ? [fmtPower(e.add)] : [])];
  const pad = compact ? "px-2 py-1.5" : "px-3 py-2.5";
  return (
    <table className={cx("w-full font-mono tnum", compact ? "text-[13px]" : "text-[15px]")}>
      <thead>
        <tr className="text-left text-[12px] tracking-wider text-faint">
          <th className={cx(pad, "font-semibold")}>Eye</th>
          {cols.map((c) => <th key={c} className={cx(pad, "text-right font-semibold")}>{c}</th>)}
        </tr>
      </thead>
      <tbody>
        {([["OD", od], ["OS", os]] as const).map(([label, eye]) => (
          <tr key={label} className="border-t border-line/70">
            <td className={cx(pad, "font-sans font-semibold")}>{label}</td>
            {cells(eye).map((v, i) => <td key={i} className={cx(pad, "text-right")}>{v}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose(): void; title: string; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    ref.current?.querySelector<HTMLElement>("input, select, textarea, button[data-autofocus]")?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-night/40 p-4 pt-[12vh] backdrop-blur-[2px]" onMouseDown={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx("animate-rise w-full rounded-2xl bg-panel shadow-pop", wide ? "max-w-2xl" : "max-w-md")}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-soft hover:bg-tint/60" aria-label="Close"><X className="size-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[13px] text-soft">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[15px] text-ink placeholder:text-faint focus:border-brand focus:ring-3 focus:ring-brand/15 focus:outline-none";
