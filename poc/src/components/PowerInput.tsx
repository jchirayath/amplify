import { ChevronDown, ChevronUp } from "lucide-react";
import { fmtPower, parseNumber, stepPower } from "../lib/rx";
import { cx } from "./ui";

export type PowerKind = "power" | "add" | "prism" | "axis" | "pd";

const RANGE: Record<PowerKind, { min: number; max: number; step: number }> = {
  power: { min: -20, max: 20, step: 0.25 },
  add: { min: 0.25, max: 4, step: 0.25 },
  prism: { min: 0, max: 10, step: 0.25 },
  axis: { min: 1, max: 180, step: 1 },
  pd: { min: 40, max: 80, step: 0.5 },
};

/** Tidy a typed value on blur: signs and two decimals for powers, whole degrees for axis. */
export function normalize(kind: PowerKind, raw: string): string {
  const n = parseNumber(raw);
  if (n == null) return raw.trim();
  switch (kind) {
    case "power": case "add": return fmtPower(n);
    case "prism": return n === 0 ? "" : n.toFixed(2);
    case "axis": return Number.isInteger(n) ? String(n) : raw.trim();
    case "pd": return String(n);
  }
}

function step(kind: PowerKind, raw: string, dir: 1 | -1): string {
  const { min, max, step: s } = RANGE[kind];
  if (kind === "axis") {
    const cur = parseNumber(raw);
    if (cur == null) return dir > 0 ? "1" : "180";
    let next = Math.round(cur) + dir;
    if (next > 180) next = 1;
    if (next < 1) next = 180;
    return String(next);
  }
  if (kind === "pd") {
    const cur = parseNumber(raw) ?? 62;
    return String(Math.min(max, Math.max(min, Math.round((cur + dir * s) * 2) / 2)));
  }
  if (kind === "prism") {
    const cur = parseNumber(raw) ?? 0;
    const next = Math.min(max, Math.max(min, Math.round((cur + dir * s) * 4) / 4));
    return next === 0 ? "" : next.toFixed(2);
  }
  if (kind === "add" && parseNumber(raw) == null) return dir > 0 ? "+1.00" : "";
  return stepPower(raw, dir * s, min, max);
}

interface Props {
  id: string;
  kind: PowerKind;
  value: string;
  onChange(v: string): void;
  onBlur?(): void;
  label: string;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  ghost?: string;
  flash?: boolean;
  className?: string;
}

export default function PowerInput({ id, kind, value, onChange, onBlur, label, error, disabled, placeholder, ghost, flash, className }: Props) {
  const bump = (dir: 1 | -1) => { if (!disabled) onChange(step(kind, value, dir)); };
  return (
    <div className={cx("group relative", className)}>
      <input
        id={id}
        aria-label={label}
        aria-invalid={!!error || undefined}
        title={error}
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        disabled={disabled}
        value={disabled ? "" : value}
        placeholder={disabled ? "–" : placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") { e.preventDefault(); bump(1); }
          else if (e.key === "ArrowDown") { e.preventDefault(); bump(-1); }
        }}
        onBlur={() => { onChange(normalize(kind, value)); onBlur?.(); }}
        className={cx(
          "h-12 w-full min-w-0 rounded-xl border bg-white pr-5 pl-2 text-right font-mono text-[15px] tnum transition-colors placeholder:text-faint focus:ring-3 focus:outline-none disabled:cursor-not-allowed disabled:bg-canvas",
          error ? "border-danger focus:border-danger focus:ring-danger/15" : "border-line focus:border-brand focus:ring-brand/15",
          flash && "animate-flash",
        )}
      />
      {!disabled && (
        <div className="absolute inset-y-1 right-0.5 flex flex-col opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <button type="button" tabIndex={-1} aria-label={`Increase ${label}`} onClick={() => bump(1)} className="flex-1 rounded-md px-0.5 text-faint hover:bg-tint hover:text-ink"><ChevronUp className="size-3.5" /></button>
          <button type="button" tabIndex={-1} aria-label={`Decrease ${label}`} onClick={() => bump(-1)} className="flex-1 rounded-md px-0.5 text-faint hover:bg-tint hover:text-ink"><ChevronDown className="size-3.5" /></button>
        </div>
      )}
      {ghost && ghost !== "–" && <p className="mt-1 text-right font-mono text-[11px] text-faint tnum" aria-hidden="true">last {ghost}</p>}
    </div>
  );
}
