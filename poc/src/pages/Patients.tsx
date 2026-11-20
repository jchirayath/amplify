import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Search, UserPlus } from "lucide-react";
import { ageFrom, fmtDate, rxStatus } from "../lib/dates";
import { eyeSummary } from "../lib/rx";
import { fullName, initials, useStore } from "../lib/store";
import { Button, Card, Field, Modal, PageHeader, StatusBadge, inputCls } from "../components/ui";
import { useToast } from "../components/Toast";

export default function Patients() {
  const { state, latest, addPatient } = useStore();
  const navigate = useNavigate();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return state.patients
      .filter((p) => !needle || `${fullName(p)} ${p.dob} ${fmtDate(p.dob)} ${p.email}`.toLowerCase().includes(needle))
      .sort((a, b) => a.lastName.localeCompare(b.lastName));
  }, [q, state.patients]);

  return (
    <>
      <PageHeader
        eyebrow="Patients"
        title="Patients"
        sub={`${state.patients.length} patients · sample data`}
        actions={<Button variant="primary" onClick={() => setAdding(true)}><UserPlus className="size-4" />New patient</Button>}
      />

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-faint" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by name, date of birth or email" className={`${inputCls} py-3 pl-12`} aria-label="Filter patients" />
      </div>

      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-semibold">No patients match “{q}”.</p>
            <Button className="mt-4" onClick={() => setAdding(true)}><UserPlus className="size-4" />Add a new patient</Button>
          </div>
        ) : (
          <ul>
            {rows.map((p, i) => {
              const rx = latest(p.id);
              return (
                <li key={p.id} className={i ? "border-t border-line/70" : ""}>
                  <Link to={`/patients/${p.id}`} className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-tint/40">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-tint font-semibold text-brand-dark">{initials(p)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{fullName(p)}</span>
                      <span className="text-[13px] text-soft">DOB {fmtDate(p.dob)} · {ageFrom(p.dob)} yrs</span>
                    </span>
                    <span className="hidden min-w-0 text-right md:block">
                      {rx ? (
                        <>
                          <span className="block font-mono text-[13px] text-ink tnum">OD {eyeSummary(rx.od)}</span>
                          <span className="block font-mono text-[13px] text-ink tnum">OS {eyeSummary(rx.os)}</span>
                        </>
                      ) : <span className="text-[13px] text-faint">No prescription yet</span>}
                    </span>
                    <span className="w-28 text-right">{rx && <StatusBadge status={rxStatus(rx.expiresAt)} />}</span>
                    <ChevronRight className="size-4 text-faint transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <NewPatientModal
        open={adding}
        initialName={q}
        onClose={() => setAdding(false)}
        onSave={(p) => {
          const created = addPatient(p);
          setAdding(false);
          toast(`${fullName(created)} added`);
          navigate(`/patients/${created.id}`);
        }}
      />
    </>
  );
}

function NewPatientModal({ open, onClose, onSave, initialName }: {
  open: boolean; onClose(): void; initialName: string;
  onSave(p: { firstName: string; lastName: string; dob: string; email: string; phone: string }): void;
}) {
  const [first, ...rest] = initialName.trim().split(/\s+/);
  const [f, setF] = useState({ firstName: "", lastName: "", dob: "", email: "", phone: "" });
  const [touched, setTouched] = useState(false);
  const [lastOpen, setLastOpen] = useState(false);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) { setF({ firstName: first ?? "", lastName: rest.join(" "), dob: "", email: "", phone: "" }); setTouched(false); }
  }
  const missing = !f.firstName.trim() || !f.lastName.trim() || !f.dob;
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!missing) onSave({ ...f, firstName: f.firstName.trim(), lastName: f.lastName.trim() });
  };
  return (
    <Modal open={open} onClose={onClose} title="New patient">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name"><input className={inputCls} value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} /></Field>
          <Field label="Last name"><input className={inputCls} value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} /></Field>
        </div>
        <Field label="Date of birth"><input type="date" className={inputCls} max={new Date().toISOString().slice(0, 10)} value={f.dob} onChange={(e) => setF({ ...f, dob: e.target.value })} /></Field>
        <Field label="Email (optional)"><input type="email" className={inputCls} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        {touched && missing && <p className="text-sm text-danger">First name, last name and date of birth are required.</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Add patient</Button>
        </div>
      </form>
    </Modal>
  );
}
