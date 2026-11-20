import type { Base, Eye, Prescription } from "./types";

export const BASES: Base[] = ["BU", "BD", "BI", "BO"];
export const BASE_LABEL: Record<Base, string> = {
  BU: "Base up",
  BD: "Base down",
  BI: "Base in",
  BO: "Base out",
};

const MINUS = "−";

/** Signed, two decimals, typographic minus: +1.25, −0.50, 0.00. */
export function fmtPower(v: number | null | undefined): string {
  if (v == null) return "–";
  if (v === 0) return "0.00";
  return (v > 0 ? "+" : MINUS) + Math.abs(v).toFixed(2);
}

export function fmtAxis(v: number | null | undefined): string {
  return v == null ? "–" : String(v);
}

/** Accepts "-1.25", "−1.25", "+1", "1.", ".5", " 2 ". Returns null for blank or unparseable. */
export function parseNumber(raw: string): number | null {
  const s = raw.trim().replace(MINUS, "-").replace(/^\+/, "");
  if (s === "" || s === "-" || s === ".") return null;
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return null;
  return Number(s);
}

export function isQuarter(v: number): boolean {
  return Math.abs(v * 4 - Math.round(v * 4)) < 1e-9;
}

export function stepPower(raw: string, delta: number, min: number, max: number): string {
  const cur = parseNumber(raw) ?? 0;
  const next = Math.min(max, Math.max(min, Math.round((cur + delta) * 4) / 4));
  return fmtPower(next);
}

// ---------- Draft (what the form holds) ----------

export interface EyeDraft {
  sph: string;
  cyl: string;
  axis: string;
  prism: string;
  base: "" | Base;
  add: string;
}

export interface RxDraft {
  od: EyeDraft;
  os: EyeDraft;
  pd: string;
  notes: string;
}

export const emptyEye = (): EyeDraft => ({ sph: "", cyl: "", axis: "", prism: "", base: "", add: "" });
export const emptyDraft = (): RxDraft => ({ od: emptyEye(), os: emptyEye(), pd: "", notes: "" });

export function eyeToDraft(e: Eye): EyeDraft {
  return {
    sph: fmtPower(e.sph),
    cyl: e.cyl === 0 ? "" : fmtPower(e.cyl),
    axis: e.axis == null ? "" : String(e.axis),
    prism: e.prism === 0 ? "" : e.prism.toFixed(2),
    base: e.base ?? "",
    add: e.add == null ? "" : fmtPower(e.add),
  };
}

// ---------- Validation ----------

export type FieldKey = `${"od" | "os"}.${keyof EyeDraft}` | "pd";

export interface Check {
  level: "error" | "warning";
  field?: FieldKey;
  message: string;
}

export interface ValidationResult {
  checks: Check[];
  errors: Partial<Record<FieldKey, string>>;
  value: { od: Eye; os: Eye; pd: number } | null;
}

const EYE_NAME = { od: "OD (right)", os: "OS (left)" } as const;

function validateEye(side: "od" | "os", d: EyeDraft, checks: Check[]): Eye | null {
  const name = EYE_NAME[side];
  const err = (f: keyof EyeDraft, message: string) =>
    checks.push({ level: "error", field: `${side}.${f}`, message: `${name}: ${message}` });
  let ok = true;

  const sph = parseNumber(d.sph);
  if (d.sph.trim() === "") { err("sph", "SPH is required (enter 0.00 for plano)."); ok = false; }
  else if (sph == null) { err("sph", "SPH must be a number."); ok = false; }
  else if (sph < -20 || sph > 20) { err("sph", "SPH must be between −20.00 and +20.00."); ok = false; }
  else if (!isQuarter(sph)) { err("sph", "SPH must be in 0.25 steps."); ok = false; }

  const cyl = d.cyl.trim() === "" ? 0 : parseNumber(d.cyl);
  if (cyl == null) { err("cyl", "CYL must be a number."); ok = false; }
  else if (cyl < -10 || cyl > 10) { err("cyl", "CYL must be between −10.00 and +10.00."); ok = false; }
  else if (!isQuarter(cyl)) { err("cyl", "CYL must be in 0.25 steps."); ok = false; }

  let axis: number | null = null;
  if (cyl != null && cyl !== 0) {
    const a = parseNumber(d.axis);
    if (d.axis.trim() === "") { err("axis", "AXIS is required when CYL isn’t 0."); ok = false; }
    else if (a == null || !Number.isInteger(a) || a < 1 || a > 180) { err("axis", "AXIS must be a whole number from 1 to 180."); ok = false; }
    else axis = a;
  }

  const prism = d.prism.trim() === "" ? 0 : parseNumber(d.prism);
  if (prism == null || prism < 0 || prism > 10) { err("prism", "PRISM must be between 0 and 10."); ok = false; }
  else if (!isQuarter(prism)) { err("prism", "PRISM must be in 0.25 steps."); ok = false; }
  let base: Base | null = null;
  if (prism != null && prism > 0) {
    if (d.base === "") { err("base", "choose a BASE direction for the prism."); ok = false; }
    else base = d.base;
  }

  let add: number | null = null;
  if (d.add.trim() !== "") {
    const a = parseNumber(d.add);
    if (a == null) { err("add", "ADD must be a number."); ok = false; }
    else if (a <= 0 || a > 4) { err("add", "ADD must be between +0.25 and +4.00."); ok = false; }
    else if (!isQuarter(a)) { err("add", "ADD must be in 0.25 steps."); ok = false; }
    else add = a;
  }

  if (!ok || sph == null || cyl == null || prism == null) return null;
  return { sph, cyl, axis, prism, base, add };
}

export const THRESHOLD = { power: 0.5, axis: 15, axisMinCyl: 0.75 };

export function validate(draft: RxDraft, previous?: Prescription | null): ValidationResult {
  const checks: Check[] = [];
  const od = validateEye("od", draft.od, checks);
  const os = validateEye("os", draft.os, checks);

  const pd = parseNumber(draft.pd);
  if (draft.pd.trim() === "") checks.push({ level: "error", field: "pd", message: "PD is required." });
  else if (pd == null || pd < 40 || pd > 80) checks.push({ level: "error", field: "pd", message: "PD must be between 40 and 80 mm." });

  if (od && os) {
    if ((od.add == null) !== (os.add == null)) {
      checks.push({ level: "warning", message: "ADD is set for one eye only." });
    } else if (od.add != null && os.add != null && od.add !== os.add) {
      checks.push({ level: "warning", message: `ADD differs between eyes (${fmtPower(od.add)} vs ${fmtPower(os.add)}).` });
    }
    if (Math.abs(od.sph - os.sph) > 3) {
      checks.push({ level: "warning", message: "SPH differs by more than 3.00 between eyes. Please confirm." });
    }
    if (previous) {
      for (const c of compareRx(previous, { od, os }).filter((c) => c.significant)) {
        checks.push({ level: "warning", message: `Since last visit: ${c.label}.` });
      }
    }
  }

  const errors: Partial<Record<FieldKey, string>> = {};
  for (const c of checks) if (c.level === "error" && c.field && !errors[c.field]) errors[c.field] = c.message;

  const value = od && os && pd != null && !checks.some((c) => c.level === "error") ? { od, os, pd } : null;
  return { checks, errors, value };
}

// ---------- Changes between visits ----------

export interface Change {
  label: string;
  significant: boolean;
}

export function compareRx(prev: Pick<Prescription, "od" | "os">, cur: Pick<Prescription, "od" | "os">): Change[] {
  const out: Change[] = [];
  for (const side of ["od", "os"] as const) {
    const a = prev[side];
    const b = cur[side];
    const tag = side.toUpperCase();
    if (a.sph !== b.sph) out.push({ label: `${tag} SPH ${fmtPower(a.sph)} → ${fmtPower(b.sph)}`, significant: Math.abs(a.sph - b.sph) > THRESHOLD.power });
    if (a.cyl !== b.cyl) out.push({ label: `${tag} CYL ${fmtPower(a.cyl)} → ${fmtPower(b.cyl)}`, significant: Math.abs(a.cyl - b.cyl) > THRESHOLD.power });
    if (a.axis != null && b.axis != null && a.axis !== b.axis) {
      const diff = Math.min(Math.abs(a.axis - b.axis), 180 - Math.abs(a.axis - b.axis));
      const strong = Math.abs(a.cyl) >= THRESHOLD.axisMinCyl && Math.abs(b.cyl) >= THRESHOLD.axisMinCyl;
      out.push({ label: `${tag} AXIS ${a.axis} → ${b.axis}`, significant: strong && diff > THRESHOLD.axis });
    }
    if (a.prism !== b.prism || a.base !== b.base) {
      out.push({ label: `${tag} PRISM ${a.prism.toFixed(2)}${a.base ? " " + a.base : ""} → ${b.prism.toFixed(2)}${b.base ? " " + b.base : ""}`, significant: true });
    }
  }
  const addA = prev.od.add ?? prev.os.add;
  const addB = cur.od.add ?? cur.os.add;
  if (addA == null && addB != null) out.push({ label: `ADD added ${fmtPower(addB)}`, significant: false });
  else if (addA != null && addB == null) out.push({ label: "ADD removed", significant: true });
  else if (addA != null && addB != null && addA !== addB) out.push({ label: `ADD ${fmtPower(addA)} → ${fmtPower(addB)}`, significant: Math.abs(addA - addB) > THRESHOLD.power });
  return out;
}

/** "−2.25 −0.75 × 180" — the way a prescription is read aloud. */
export function eyeSummary(e: Eye): string {
  let s = fmtPower(e.sph);
  if (e.cyl !== 0) s += ` ${fmtPower(e.cyl)} × ${e.axis}`;
  if (e.prism > 0) s += ` · ${e.prism.toFixed(2)}Δ ${e.base}`;
  return s;
}
