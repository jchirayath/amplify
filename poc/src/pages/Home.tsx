import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowRight, Camera, FilePlus2, FileText } from "lucide-react";
import type { ReactNode } from "react";
import { daysAgo, daysUntil, fmtDate, rxStatus, EXPIRING_WINDOW_DAYS } from "../lib/dates";
import { fmtPower } from "../lib/rx";
import { fullName, useStore } from "../lib/store";
import type { Prescription } from "../lib/types";
import { Button, Card, PageHeader, StatusBadge, cx } from "../components/ui";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function Home() {
  const { state, patient, latest } = useStore();
  const navigate = useNavigate();

  const weekAgo = daysAgo(7).toISOString();
  const latestPerPatient = state.patients.map((p) => latest(p.id)).filter((r): r is Prescription => !!r);
  const thisWeek = state.prescriptions.filter((r) => r.issuedAt >= weekAgo);
  const expiring = latestPerPatient
    .filter((r) => rxStatus(r.expiresAt) === "expiring")
    .sort((a, b) => a.expiresAt.localeCompare(b.expiresAt));
  const missingScan = latestPerPatient.filter((r) => !r.scan && r.issuedAt >= daysAgo(30).toISOString());
  const recent = [...state.prescriptions].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)).slice(0, 6);

  return (
    <>
      <PageHeader
        eyebrow={new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        title={`${greeting()}, ${state.settings.userName}`}
        sub="Here’s what needs attention today."
        actions={<Button variant="primary" onClick={() => navigate("/rx/new")}><FilePlus2 className="size-4" />New prescription</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Tile icon={<FileText className="size-5" />} value={thisWeek.length} label="Prescriptions this week" />
        <Tile icon={<AlertTriangle className="size-5" />} value={expiring.length} label={`Expiring in ${EXPIRING_WINDOW_DAYS} days`} tone="warn" />
        <Tile icon={<Camera className="size-5" />} value={missingScan.length} label="Recent, missing a scan" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="min-w-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <h2 className="text-lg font-bold">Recent prescriptions</h2>
            <Link to="/patients" className="text-sm font-semibold text-brand hover:underline">All patients</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-[15px]">
              <thead>
                <tr className="text-left text-[12px] tracking-wider text-faint uppercase">
                  <th className="px-6 py-2 font-semibold">Patient</th>
                  <th className="px-3 py-2 font-semibold">Issued</th>
                  <th className="px-3 py-2 text-right font-semibold">OD SPH</th>
                  <th className="px-3 py-2 text-right font-semibold">OS SPH</th>
                  <th className="px-6 py-2 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => {
                  const p = patient(r.patientId);
                  return (
                    <tr key={r.id} onClick={() => navigate(`/rx/${r.id}`)} className="cursor-pointer border-t border-line/70 transition-colors hover:bg-tint/40">
                      <td className="px-6 py-3 font-semibold">
                        <Link to={`/rx/${r.id}`} onClick={(e) => e.stopPropagation()} className="hover:underline">{p ? fullName(p) : "Unknown"}</Link>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-soft">{fmtDate(r.issuedAt)}</td>
                      <td className="px-3 py-3 text-right font-mono tnum">{fmtPower(r.od.sph)}</td>
                      <td className="px-3 py-3 text-right font-mono tnum">{fmtPower(r.os.sph)}</td>
                      <td className="px-6 py-3 text-right">{r.scan ? <StatusBadge status={rxStatus(r.expiresAt)} /> : <span className="inline-flex rounded-full bg-warn-bg px-2.5 py-0.5 text-[13px] font-semibold text-warn">Scan needed</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold">Expiring soon</h2>
          <p className="mb-4 text-sm text-soft">A good list for recall calls this week.</p>
          {expiring.length === 0 ? (
            <p className="rounded-xl bg-canvas p-4 text-sm text-soft">Nothing expires in the next {EXPIRING_WINDOW_DAYS} days.</p>
          ) : (
            <ul className="space-y-2">
              {expiring.map((r) => {
                const p = patient(r.patientId)!;
                const left = daysUntil(r.expiresAt);
                return (
                  <li key={r.id}>
                    <Link to={`/patients/${p.id}`} className="group flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3 transition-colors hover:border-accent">
                      <span>
                        <span className="block font-semibold">{fullName(p)}</span>
                        <span className="text-[13px] text-warn">Expires in {left} {left === 1 ? "day" : "days"} · {fmtDate(r.expiresAt)}</span>
                      </span>
                      <ArrowRight className="size-4 text-faint transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

function Tile({ icon, value, label, tone }: { icon: ReactNode; value: number; label: string; tone?: "warn" }) {
  return (
    <Card className={cx("flex items-center gap-4 p-5", tone === "warn" && "border-accent/50 bg-warn-bg")}>
      <span className={cx("grid size-11 place-items-center rounded-xl", tone === "warn" ? "bg-accent/25 text-warn" : "bg-tint text-brand")}>{icon}</span>
      <span>
        <span className={cx("block font-mono text-[32px] leading-none font-semibold tnum", tone === "warn" ? "text-warn" : "text-ink")}>{value}</span>
        <span className={cx("text-sm", tone === "warn" ? "text-warn" : "text-soft")}>{label}</span>
      </span>
    </Card>
  );
}
