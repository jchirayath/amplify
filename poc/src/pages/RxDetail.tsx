import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, Copy, Download, FlaskConical, Link2, Printer } from "lucide-react";
import { ageFrom, fmtDate, rxStatus } from "../lib/dates";
import { compareRx } from "../lib/rx";
import { fullName, useStore } from "../lib/store";
import { Button, Card, DemoTag, Field, Modal, Pill, RxTable, StatusBadge, inputCls } from "../components/ui";
import { useToast } from "../components/Toast";

const LABS = ["Clearview Lens Lab", "Summit Optical Lab", "Harbor Lens Co."];

export default function RxDetail() {
  const { id } = useParams();
  const { rx: getRx, patient, history, state } = useStore();
  const toast = useToast();
  const rx = getRx(id);
  const [shareOpen, setShareOpen] = useState(false);
  const [labOpen, setLabOpen] = useState(false);

  if (!rx) {
    return (
      <Card className="p-10 text-center">
        <p className="font-semibold">That prescription isn’t in the demo data.</p>
        <Link to="/" className="mt-3 inline-block font-semibold text-brand">Go home</Link>
      </Card>
    );
  }
  const p = patient(rx.patientId)!;
  const all = history(p.id);
  const prev = all[all.findIndex((r) => r.id === rx.id) + 1];
  const changes = prev ? compareRx(prev, rx) : [];

  return (
    <>
      <Link to={`/patients/${p.id}`} className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-soft hover:text-ink print:hidden"><ArrowLeft className="size-4" />{fullName(p)}</Link>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        {/* The printable prescription */}
        <article className="print-area min-w-0 rounded-2xl border border-line bg-white p-7 shadow-card md:p-10">
          <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-ink pb-5">
            <div>
              <p className="text-xl font-bold tracking-tight">{state.settings.practiceName}</p>
              <p className="text-sm text-soft">Spectacle prescription</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-mono tnum">Rx #{rx.id.slice(0, 8).toUpperCase()}</p>
              <p className="text-soft">Issued {fmtDate(rx.issuedAt)}</p>
            </div>
          </header>

          <dl className="grid grid-cols-2 gap-4 py-6 text-[15px] sm:grid-cols-3">
            <div><dt className="text-[12px] font-semibold tracking-wider text-faint uppercase">Patient</dt><dd className="font-semibold">{fullName(p)}</dd></div>
            <div><dt className="text-[12px] font-semibold tracking-wider text-faint uppercase">Date of birth</dt><dd>{fmtDate(p.dob)} ({ageFrom(p.dob)})</dd></div>
            <div><dt className="text-[12px] font-semibold tracking-wider text-faint uppercase">Expires</dt><dd>{fmtDate(rx.expiresAt)}</dd></div>
          </dl>

          <div className="rounded-xl border border-line px-2 py-1"><RxTable od={rx.od} os={rx.os} /></div>

          <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-[15px]">
            <p><span className="text-soft">PD</span> <span className="font-mono font-semibold tnum">{rx.pd} mm</span></p>
            {rx.notes && <p><span className="text-soft">Notes</span> {rx.notes}</p>}
          </div>

          <footer className="mt-12 grid gap-8 sm:grid-cols-2">
            <div>
              <p className="h-10 border-b border-ink font-[cursive] text-2xl text-ink/80 italic">{rx.prescriber}</p>
              <p className="mt-1.5 text-sm text-soft">{rx.prescriber} · Prescriber</p>
            </div>
            <p className="self-end text-[12px] leading-relaxed text-faint sm:text-right">Valid until {fmtDate(rx.expiresAt)}. DS = sphere only. Powers in dioptres; axis in degrees.</p>
          </footer>
        </article>

        <div className="space-y-4 print:hidden">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold">Share</h2>
              <StatusBadge status={rxStatus(rx.expiresAt)} />
            </div>
            <div className="space-y-2">
              <Button variant="primary" className="w-full justify-start" onClick={() => window.print()}><Download className="size-4" />Download PDF</Button>
              <Button className="w-full justify-start" onClick={() => setShareOpen(true)}><Link2 className="size-4" />Send secure link</Button>
              <Button className="w-full justify-start" onClick={() => setLabOpen(true)}><FlaskConical className="size-4" />Send to lab</Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => window.print()}><Printer className="size-4" />Print</Button>
            </div>
            <p className="mt-3 text-[12px] text-faint">Download PDF opens the print dialog: choose “Save as PDF”.</p>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 font-bold">Since the last visit</h2>
            {!prev ? <p className="text-sm text-soft">This is the first prescription on file.</p> : (
              <>
                <p className="mb-3 text-sm text-soft">Compared with {fmtDate(prev.issuedAt)}.</p>
                <div className="flex flex-wrap gap-2">
                  {changes.length === 0 ? <Pill>No change</Pill> : changes.map((c) => <Pill key={c.label} tone={c.significant ? "warn" : "calm"}>{c.label}</Pill>)}
                </div>
              </>
            )}
          </Card>

          {rx.scan && (
            <Card className="p-5">
              <h2 className="mb-3 font-bold">Original paper prescription</h2>
              {rx.scan.src ? (
                <a href={rx.scan.src} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-line bg-canvas">
                  <img src={rx.scan.src} alt={`Scan of the paper prescription: ${rx.scan.name}`} className="h-44 w-full object-contain" />
                </a>
              ) : <p className="text-sm text-soft">{rx.scan.name} (the image was too large to keep in this browser).</p>}
            </Card>
          )}
        </div>
      </div>

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} email={p.email} onSent={() => { setShareOpen(false); toast(`Secure link sent to ${p.email || "the patient"}`); }} />
      <LabModal open={labOpen} onClose={() => setLabOpen(false)} onSent={(lab) => { setLabOpen(false); toast(`Sent to ${lab}`); }} />
    </>
  );
}

function ShareModal({ open, onClose, email, onSent }: { open: boolean; onClose(): void; email: string; onSent(): void }) {
  const [to, setTo] = useState(email);
  const [copied, setCopied] = useState(false);
  const link = useMemo(() => `https://rx.amplify.example/s/${Math.random().toString(36).slice(2, 10)}`, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const copy = async () => {
    try { await navigator.clipboard.writeText(link); } catch { /* clipboard blocked: the link is still visible */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <Modal open={open} onClose={onClose} title="Send a secure link">
      <p className="mb-4 flex items-center gap-2 text-sm text-soft"><DemoTag />Nothing is sent in the demo.</p>
      <div className="space-y-4">
        <Field label="Patient email"><input type="email" className={inputCls} value={to} onChange={(e) => setTo(e.target.value)} /></Field>
        <Field label="Link" hint="Expires in 7 days. Opens a read-only copy of this prescription.">
          <div className="flex gap-2">
            <input readOnly value={link} className={`${inputCls} font-mono text-[13px]`} onFocus={(e) => e.target.select()} />
            <Button onClick={copy} aria-label="Copy link">{copied ? <Check className="size-4 text-brand" /> : <Copy className="size-4" />}</Button>
          </div>
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onSent}>Send link</Button>
        </div>
      </div>
    </Modal>
  );
}

function LabModal({ open, onClose, onSent }: { open: boolean; onClose(): void; onSent(lab: string): void }) {
  const [lab, setLab] = useState(LABS[0]);
  return (
    <Modal open={open} onClose={onClose} title="Send to lab">
      <p className="mb-4 flex items-center gap-2 text-sm text-soft"><DemoTag />Lab names are fictional.</p>
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-semibold">Choose a lab</legend>
        {LABS.map((l) => (
          <label key={l} className="flex cursor-pointer items-center gap-3 rounded-xl border border-line px-4 py-3 has-[:checked]:border-brand has-[:checked]:bg-tint/50">
            <input type="radio" name="lab" checked={lab === l} onChange={() => setLab(l)} className="accent-brand" />
            <span className="font-medium">{l}</span>
          </label>
        ))}
      </fieldset>
      <div className="flex justify-end gap-2 pt-6">
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={() => onSent(lab)}>Send</Button>
      </div>
    </Modal>
  );
}
