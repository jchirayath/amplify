import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Camera, ChevronRight, FilePlus2, Mail, Phone } from "lucide-react";
import { ageFrom, fmtDate, rxStatus } from "../lib/dates";
import { compareRx } from "../lib/rx";
import { fullName, initials, useStore } from "../lib/store";
import { Button, Card, Pill, RxTable, StatusBadge, cx } from "../components/ui";

export default function PatientDetail() {
  const { id } = useParams();
  const { patient, history } = useStore();
  const navigate = useNavigate();
  const p = patient(id);

  if (!p) {
    return (
      <Card className="p-10 text-center">
        <p className="font-semibold">That patient isn’t in the demo data.</p>
        <Link to="/patients" className="mt-3 inline-block font-semibold text-brand">Back to patients</Link>
      </Card>
    );
  }
  const rxs = history(p.id);

  return (
    <>
      <Link to="/patients" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-soft hover:text-ink"><ArrowLeft className="size-4" />Patients</Link>

      <div className="mb-8 flex flex-wrap items-center gap-5">
        <span className="grid size-16 place-items-center rounded-2xl bg-tint text-xl font-bold text-brand-dark">{initials(p)}</span>
        <div className="flex-1">
          <h1 className="text-[32px] leading-tight font-bold tracking-tight">{fullName(p)}</h1>
          <p className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-soft">
            <span>DOB {fmtDate(p.dob)} · {ageFrom(p.dob)} yrs</span>
            {p.email && <span className="inline-flex items-center gap-1.5"><Mail className="size-4" />{p.email}</span>}
            {p.phone && <span className="inline-flex items-center gap-1.5"><Phone className="size-4" />{p.phone}</span>}
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate(`/rx/new?patient=${p.id}`)}><FilePlus2 className="size-4" />New prescription</Button>
      </div>

      <h2 className="mb-4 text-lg font-bold">Prescription history</h2>
      {rxs.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="font-semibold">No prescriptions yet.</p>
          <p className="mt-1 text-soft">Start one now. It takes under a minute.</p>
          <Button variant="primary" className="mt-5" onClick={() => navigate(`/rx/new?patient=${p.id}`)}><FilePlus2 className="size-4" />New prescription</Button>
        </Card>
      ) : (
        <ol className="relative space-y-5 before:absolute before:top-3 before:bottom-3 before:left-[7px] before:w-0.5 before:bg-line md:before:left-[135px]">
          {rxs.map((rx, i) => {
            const prev = rxs[i + 1];
            const changes = prev ? compareRx(prev, rx) : [];
            const first = i === 0;
            return (
              <li key={rx.id} className="relative grid gap-3 pl-8 md:grid-cols-[120px_1fr] md:gap-8 md:pl-0">
                <span className={cx("absolute top-5 left-0 size-4 rounded-full border-[3px] md:left-[128px]", first ? "border-brand bg-brand" : "border-line bg-canvas")} />
                <div className="pt-3 md:text-right">
                  <p className="font-mono text-[14px] font-semibold tnum">{fmtDate(rx.issuedAt)}</p>
                  {first && <p className="text-[13px] text-brand">Latest</p>}
                </div>
                <Link to={`/rx/${rx.id}`} className={cx("group block rounded-2xl border bg-panel p-5 shadow-card transition-colors hover:border-brand/60 md:ml-6", first ? "border-brand/50" : "border-line")}>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <StatusBadge status={rxStatus(rx.expiresAt)} />
                    {rx.scan ? <Pill><Camera className="size-3.5" />Scan attached</Pill> : <Pill tone="warn"><Camera className="size-3.5" />No scan</Pill>}
                    <span className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-brand opacity-0 transition-opacity group-hover:opacity-100">Open <ChevronRight className="size-4" /></span>
                  </div>
                  <div className="-mx-3"><RxTable od={rx.od} os={rx.os} compact /></div>
                  {prev && (
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-line/70 pt-3">
                      {changes.length === 0 ? <Pill>No change since {fmtDate(prev.issuedAt)}</Pill> :
                        changes.map((c) => <Pill key={c.label} tone={c.significant ? "warn" : "calm"}>{c.significant ? "Big change: " : ""}{c.label}</Pill>)}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}
