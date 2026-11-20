import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Camera, CheckCircle2, Copy, History, Loader2, ScanLine, Search, Sparkles, Trash2, TriangleAlert, Upload, XCircle } from "lucide-react";
import { ageFrom, fmtDate } from "../lib/dates";
import { BASES, BASE_LABEL, emptyDraft, eyeToDraft, fmtAxis, fmtPower, validate, type EyeDraft, type FieldKey, type RxDraft } from "../lib/rx";
import { SAMPLE_PAPER_RX, SAMPLE_PAPER_VALUES } from "../lib/seed";
import { fullName, initials, useStore } from "../lib/store";
import type { Eye, Patient, Prescription, Scan } from "../lib/types";
import PowerInput from "../components/PowerInput";
import { Button, Card, DemoTag, PageHeader, cx, inputCls } from "../components/ui";
import { useToast } from "../components/Toast";
import { isMac } from "../components/Layout";

const COLS: Array<{ key: keyof EyeDraft; label: string; hint: string }> = [
  { key: "sph", label: "SPH", hint: "Sphere" },
  { key: "cyl", label: "CYL", hint: "Cylinder" },
  { key: "axis", label: "AXIS", hint: "1–180°" },
  { key: "prism", label: "PRISM", hint: "Δ" },
  { key: "base", label: "BASE", hint: "Direction" },
  { key: "add", label: "ADD", hint: "Near add" },
];

export default function NewRx() {
  const [params, setParams] = useSearchParams();
  const { patient } = useStore();
  const p = patient(params.get("patient") ?? undefined);
  if (!p) return <PatientPicker onPick={(id) => setParams({ patient: id })} />;
  return <RxForm key={p.id} p={p} />;
}

function RxForm({ p }: { p: Patient }) {
  const { latest, addRx } = useStore();
  const navigate = useNavigate();
  const toast = useToast();
  const prev = latest(p.id);

  const [draft, setDraft] = useState<RxDraft>(() => ({ ...emptyDraft(), pd: prev ? String(prev.pd) : "" }));
  const [touched, setTouched] = useState<Set<FieldKey>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const [flash, setFlash] = useState<Set<string>>(new Set());
  const [scan, setScan] = useState<Scan | null>(null);
  const [reading, setReading] = useState(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const result = useMemo(() => validate(draft, prev), [draft, prev]);
  const visibleError = (k: FieldKey) => (showAll || touched.has(k) ? result.errors[k] : undefined);
  const errors = result.checks.filter((c) => c.level === "error" && (showAll || (c.field && touched.has(c.field))));
  const warnings = result.checks.filter((c) => c.level === "warning");
  const pending = result.checks.filter((c) => c.level === "error").length - errors.length;

  const setEye = (side: "od" | "os", key: keyof EyeDraft, v: string) =>
    setDraft((d) => ({ ...d, [side]: { ...d[side], [key]: v } }));
  const touch = (k: FieldKey) => setTouched((t) => (t.has(k) ? t : new Set(t).add(k)));

  const flashKeys = (keys: string[]) => {
    setFlash(new Set(keys));
    timers.current.push(window.setTimeout(() => setFlash(new Set()), 950));
  };

  const copyOdToOs = () => { setDraft((d) => ({ ...d, os: { ...d.od } })); flashKeys(COLS.map((c) => `os.${c.key}`)); };
  const useLast = () => {
    if (!prev) return;
    setDraft((d) => ({ ...d, od: eyeToDraft(prev.od), os: eyeToDraft(prev.os), pd: String(prev.pd) }));
    flashKeys([...COLS.flatMap((c) => [`od.${c.key}`, `os.${c.key}`]), "pd"]);
  };

  /** Simulated OCR: fills the grid one field at a time so the audience can watch it happen. */
  const readFromPhoto = () => {
    if (!scan) return;
    setReading(true);
    const values: { od: Eye; os: Eye; pd: number } =
      scan.src === SAMPLE_PAPER_RX || !prev ? SAMPLE_PAPER_VALUES
        : { od: { ...prev.od, sph: prev.od.sph - 0.25 }, os: { ...prev.os, sph: prev.os.sph - 0.25 }, pd: prev.pd };
    const target = { od: eyeToDraft(values.od), os: eyeToDraft(values.os) };
    const steps: Array<[string, () => void]> = [];
    for (const side of ["od", "os"] as const)
      for (const c of COLS) steps.push([`${side}.${c.key}`, () => setEye(side, c.key, target[side][c.key])]);
    steps.push(["pd", () => setDraft((d) => ({ ...d, pd: String(values.pd) }))]);
    setDraft((d) => ({ ...d, od: { ...emptyDraftEye }, os: { ...emptyDraftEye } }));
    steps.forEach(([key, apply], i) => {
      timers.current.push(window.setTimeout(() => {
        apply();
        setFlash((f) => new Set(f).add(key));
        if (i === steps.length - 1) {
          setReading(false);
          setShowAll(true);
          toast("Values read from photo. Please check them against the original.", "info");
          timers.current.push(window.setTimeout(() => setFlash(new Set()), 950));
        }
      }, 500 + i * 85));
    });
  };

  const save = useCallback(() => {
    if (!result.value) {
      setShowAll(true);
      const first = result.checks.find((c) => c.level === "error" && c.field);
      if (first?.field) document.getElementById(`f-${first.field.replace(".", "-")}`)?.focus();
      return;
    }
    const rx = addRx({ patientId: p.id, ...result.value, notes: draft.notes.trim(), scan });
    toast(`Prescription saved for ${fullName(p)}`);
    navigate(`/rx/${rx.id}`, { replace: true });
  }, [result, addRx, p, draft.notes, scan, toast, navigate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); save(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save]);

  return (
    <>
      <Link to={`/patients/${p.id}`} className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-soft hover:text-ink"><ArrowLeft className="size-4" />{fullName(p)}</Link>
      <PageHeader eyebrow="New prescription" title={fullName(p)} sub={`DOB ${fmtDate(p.dob)} · ${ageFrom(p.dob)} yrs${prev ? ` · last Rx ${fmtDate(prev.issuedAt)}` : " · first prescription"}`} />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-6">
          <Card className="p-5 md:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Refraction</h2>
              <div className="flex flex-wrap gap-2">
                {prev && <Button variant="ghost" onClick={useLast}><History className="size-4" />Start from last Rx</Button>}
                <Button variant="ghost" onClick={copyOdToOs}><Copy className="size-4" />Copy OD to OS</Button>
              </div>
            </div>

            <div className="-mx-1 overflow-x-auto px-1 pb-1">
              <div className="grid min-w-[640px] grid-cols-[96px_repeat(6,minmax(0,1fr))] gap-x-2.5 gap-y-1">
                <div />
                {COLS.map((c) => (
                  <div key={c.key} className="pb-1 text-right">
                    <p className="text-[12px] font-bold tracking-wider text-ink">{c.label}</p>
                    <p className="text-[11px] text-faint">{c.hint}</p>
                  </div>
                ))}
                {(["od", "os"] as const).map((side) => {
                  const d = draft[side];
                  const cylZero = d.cyl.trim() === "" || Number(d.cyl.replace("−", "-")) === 0;
                  const prismZero = d.prism.trim() === "" || Number(d.prism) === 0;
                  const last = prev?.[side];
                  return (
                    <div key={side} className="contents">
                      <div className="flex flex-col justify-start pt-2.5">
                        <p className="font-bold">{side.toUpperCase()}</p>
                        <p className="text-[12px] text-soft">{side === "od" ? "Right eye" : "Left eye"}</p>
                      </div>
                      {COLS.map((c) => {
                        const k = `${side}.${c.key}` as FieldKey;
                        const id = `f-${side}-${c.key}`;
                        if (c.key === "base") {
                          return (
                            <div key={k}>
                              <select
                                id={id}
                                aria-label={`${side.toUpperCase()} prism base`}
                                disabled={prismZero}
                                value={prismZero ? "" : d.base}
                                onChange={(e) => setEye(side, "base", e.target.value)}
                                onBlur={() => touch(k)}
                                className={cx("h-12 w-full rounded-xl border bg-white px-2 font-mono text-[15px] focus:ring-3 focus:outline-none disabled:cursor-not-allowed disabled:bg-canvas disabled:text-faint",
                                  visibleError(k) ? "border-danger" : "border-line focus:border-brand focus:ring-brand/15", flash.has(k) && "animate-flash")}
                              >
                                <option value="">–</option>
                                {BASES.map((b) => <option key={b} value={b}>{b} · {BASE_LABEL[b]}</option>)}
                              </select>
                              {last?.base && <p className="mt-1 text-right font-mono text-[11px] text-faint">last {last.base}</p>}
                            </div>
                          );
                        }
                        const kind = c.key === "axis" ? "axis" : c.key === "prism" ? "prism" : c.key === "add" ? "add" : "power";
                        const ghost = last && ({
                          sph: fmtPower(last.sph), cyl: last.cyl ? fmtPower(last.cyl) : "DS", axis: fmtAxis(last.axis),
                          prism: last.prism ? last.prism.toFixed(2) : "–", add: fmtPower(last.add), base: "",
                        } as const)[c.key];
                        return (
                          <PowerInput
                            key={k}
                            id={id}
                            kind={kind}
                            label={`${side.toUpperCase()} ${c.label}`}
                            value={d[c.key]}
                            onChange={(v) => setEye(side, c.key, v)}
                            onBlur={() => touch(k)}
                            error={visibleError(k)}
                            disabled={(c.key === "axis" && cylZero) || false}
                            placeholder={c.key === "sph" ? "0.00" : c.key === "cyl" ? "DS" : c.key === "axis" ? "°" : "–"}
                            ghost={ghost}
                            flash={flash.has(k)}
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 grid gap-4 border-t border-line/70 pt-5 sm:grid-cols-[180px_1fr]">
              <div>
                <label htmlFor="f-pd" className="mb-1.5 block text-sm font-semibold">PD <span className="font-normal text-soft">(mm)</span></label>
                <PowerInput id="f-pd" kind="pd" label="Pupillary distance" value={draft.pd} onChange={(v) => setDraft((d) => ({ ...d, pd: v }))}
                  onBlur={() => touch("pd")} error={visibleError("pd")} placeholder="62" flash={flash.has("pd")} />
              </div>
              <div>
                <label htmlFor="f-notes" className="mb-1.5 block text-sm font-semibold">Notes <span className="font-normal text-soft">(optional)</span></label>
                <input id="f-notes" className={cx(inputCls, "h-12")} placeholder="e.g. anti-reflective coating recommended" value={draft.notes} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} />
              </div>
            </div>
            <p className="mt-4 text-[13px] text-faint">Tip: arrow keys step powers by 0.25 and axis by 1°. Values tidy themselves when you leave a field.</p>
          </Card>

          <ScanCard scan={scan} setScan={setScan} reading={reading} onRead={readFromPhoto} />
        </div>

        <div className="space-y-4 lg:sticky lg:top-8">
          <Card className="p-5">
            <h2 className="mb-3 flex items-center gap-2 font-bold"><ScanLine className="size-[18px] text-brand" />Checks</h2>
            <ul className="space-y-2" aria-live="polite">
              {errors.map((c, i) => (
                <li key={`e${i}`} className="animate-rise flex gap-2.5 rounded-xl bg-danger-bg px-3 py-2.5 text-[14px] text-danger">
                  <XCircle className="mt-0.5 size-4 shrink-0" />
                  <button type="button" className="text-left hover:underline" onClick={() => c.field && document.getElementById(`f-${c.field.replace(".", "-")}`)?.focus()}>{c.message}</button>
                </li>
              ))}
              {warnings.map((c, i) => (
                <li key={`w${i}`} className="animate-rise flex gap-2.5 rounded-xl bg-warn-bg px-3 py-2.5 text-[14px] text-warn">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" />{c.message}
                </li>
              ))}
              {errors.length === 0 && pending === 0 && (
                <li className="animate-rise flex gap-2.5 rounded-xl bg-tint px-3 py-2.5 text-[14px] text-brand-dark">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0" />All values are valid{warnings.length ? "; review the notes above" : ""}.
                </li>
              )}
              {errors.length === 0 && pending > 0 && (
                <li className="rounded-xl bg-canvas px-3 py-2.5 text-[14px] text-soft">Fill in both eyes and PD. Checks run as you type.</li>
              )}
            </ul>
            {prev && <p className="mt-4 border-t border-line/70 pt-3 text-[13px] text-soft">Compared with the prescription from {fmtDate(prev.issuedAt)}.</p>}
          </Card>
          <Button variant="primary" className="w-full py-3.5 text-base" onClick={save} disabled={reading}>
            {warnings.length && result.value ? `Save with ${warnings.length} ${warnings.length === 1 ? "note" : "notes"}` : "Save prescription"}
          </Button>
          <p className="text-center text-[12px] text-faint">{isMac ? "⌘" : "Ctrl"} + Enter to save · expires after the practice’s validity period</p>
        </div>
      </div>
    </>
  );
}

const emptyDraftEye: EyeDraft = { sph: "", cyl: "", axis: "", prism: "", base: "", add: "" };

function ScanCard({ scan, setScan, reading, onRead }: { scan: Scan | null; setScan(s: Scan | null): void; reading: boolean; onRead(): void }) {
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const take = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please choose an image file (photo or scan)."); return; }
    const reader = new FileReader();
    reader.onload = () => setScan({ name: file.name, src: String(reader.result) });
    reader.readAsDataURL(file);
  };
  const onDrop = (e: DragEvent) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files[0]); };

  return (
    <Card className="p-5 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold"><Camera className="size-5 text-brand" />Paper prescription</h2>
        <span className="text-[13px] text-soft">Optional</span>
      </div>
      {scan ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="grid h-36 w-full place-items-center overflow-hidden rounded-xl border border-line bg-canvas sm:w-52">
            {scan.src ? <img src={scan.src} alt={`Scan: ${scan.name}`} className="h-full w-full object-contain" /> : <Camera className="size-8 text-faint" />}
          </div>
          <div className="flex-1">
            <p className="font-semibold break-all">{scan.name}</p>
            <p className="mb-4 text-[13px] text-soft">Attached to this prescription when you save.</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" onClick={onRead} disabled={reading}>
                {reading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                {reading ? "Reading…" : "Fill grid from photo"}
              </Button>
              <Button variant="ghost" onClick={() => setScan(null)} disabled={reading}><Trash2 className="size-4" />Remove</Button>
            </div>
            <p className="mt-2 flex items-center gap-2 text-[12px] text-faint"><DemoTag />Reading is simulated in this demo.</p>
          </div>
        </div>
      ) : (
        <>
          <div
            onDragOver={(e) => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={onDrop}
            className={cx("flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors", over ? "border-brand bg-tint/50" : "border-line bg-canvas/60")}
          >
            <Upload className="mb-2 size-6 text-brand" />
            <p className="font-semibold">Drop a photo of the paper prescription</p>
            <p className="mb-4 text-[13px] text-soft">or</p>
            <Button onClick={() => inputRef.current?.click()}>Choose a file</Button>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e: ChangeEvent<HTMLInputElement>) => take(e.target.files?.[0])} />
          </div>
          <button type="button" onClick={() => setScan({ name: "paper-rx-sample.svg", src: SAMPLE_PAPER_RX })} className="mt-3 text-sm font-semibold text-brand hover:underline">
            Use the sample paper prescription
          </button>
        </>
      )}
    </Card>
  );
}

function PatientPicker({ onPick }: { onPick(id: string): void }) {
  const { state, latest } = useStore();
  const [q, setQ] = useState("");
  const list = state.patients
    .filter((p) => `${fullName(p)} ${p.dob}`.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => a.lastName.localeCompare(b.lastName));
  return (
    <>
      <PageHeader eyebrow="New prescription" title="Who is it for?" sub="Pick a patient to start." />
      <Card className="max-w-2xl overflow-hidden">
        <div className="relative border-b border-line">
          <Search className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-faint" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or date of birth" aria-label="Search patients"
            className="h-14 w-full bg-transparent pr-4 pl-13 text-[16px] placeholder:text-faint focus:outline-none" />
        </div>
        <ul className="max-h-[60vh] overflow-y-auto">
          {list.map((p) => {
            const rx: Prescription | undefined = latest(p.id);
            return (
              <li key={p.id}>
                <button type="button" onClick={() => onPick(p.id)} className="flex w-full items-center gap-4 px-5 py-3 text-left hover:bg-tint/40">
                  <span className="grid size-9 place-items-center rounded-full bg-tint text-sm font-semibold text-brand-dark">{initials(p)}</span>
                  <span className="flex-1"><span className="block font-semibold">{fullName(p)}</span><span className="text-[13px] text-soft">DOB {fmtDate(p.dob)}</span></span>
                  <span className="text-[13px] text-soft">{rx ? `Last Rx ${fmtDate(rx.issuedAt)}` : "No Rx yet"}</span>
                </button>
              </li>
            );
          })}
          {list.length === 0 && <li className="p-8 text-center text-soft">No patients match. <Link to="/patients" className="font-semibold text-brand">Add one</Link>.</li>}
        </ul>
      </Card>
    </>
  );
}
