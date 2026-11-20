import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { CornerDownLeft, FilePlus2, Home, RotateCcw, Search, User } from "lucide-react";
import { fmtDate } from "../lib/dates";
import { fullName, useStore } from "../lib/store";
import { useToast } from "./Toast";
import { cx } from "./ui";

interface Item { id: string; label: string; detail?: string; icon: ReactNode; run(): void }

export default function CommandPalette({ open, onClose }: { open: boolean; onClose(): void }) {
  const { state, reset } = useStore();
  const navigate = useNavigate();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) { setQ(""); setActive(0); setTimeout(() => inputRef.current?.focus(), 0); }
  }, [open]);

  const [items, patientCount] = useMemo<[Item[], number]>(() => {
    const go = (to: string) => () => { navigate(to); onClose(); };
    const needle = q.trim().toLowerCase();
    const patients = state.patients
      .filter((p) => !needle || `${fullName(p)} ${p.dob} ${fmtDate(p.dob)}`.toLowerCase().includes(needle))
      .sort((a, b) => a.lastName.localeCompare(b.lastName))
      .slice(0, needle ? 8 : 5)
      .map<Item>((p) => ({ id: p.id, label: fullName(p), detail: `DOB ${fmtDate(p.dob)}`, icon: <User className="size-4" />, run: go(`/patients/${p.id}`) }));
    const actions: Item[] = [
      { id: "new", label: "New prescription", icon: <FilePlus2 className="size-4" />, run: go("/rx/new") },
      { id: "home", label: "Go to home", icon: <Home className="size-4" />, run: go("/") },
      { id: "reset", label: "Reset demo data", icon: <RotateCcw className="size-4" />, run: () => { reset(); onClose(); navigate("/"); toast("Demo reset to sample data", "info"); } },
    ].filter((a) => !needle || a.label.toLowerCase().includes(needle));
    return [[...patients, ...actions], patients.length];
  }, [q, state.patients, navigate, onClose, reset, toast]);

  if (!open) return null;

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(items.length - 1, a + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); items[active]?.run(); }
    else if (e.key === "Escape") onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-night/40 p-4 pt-[14vh] backdrop-blur-[2px] print:hidden" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Search" className="animate-rise w-full max-w-xl overflow-hidden rounded-2xl bg-panel shadow-pop" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-line px-5">
          <Search className="size-5 text-faint" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => { setQ(e.target.value); setActive(0); }}
            onKeyDown={onKey}
            placeholder="Search patients by name or date of birth…"
            className="h-14 flex-1 bg-transparent text-[16px] placeholder:text-faint focus:outline-none"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={items[active] ? `pi-${items[active].id}` : undefined}
          />
          <kbd className="rounded-md border border-line px-1.5 font-mono text-[11px] text-soft">esc</kbd>
        </div>
        <ul id="palette-list" role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
          {items.length === 0 && <li className="px-4 py-8 text-center text-soft">No matches for “{q}”.</li>}
          {items.map((it, i) => (
            <li key={it.id}>
              {i === 0 && patientCount > 0 && <p className="px-3 pt-1 pb-1.5 text-[11px] font-semibold tracking-widest text-faint uppercase">Patients</p>}
              {i === patientCount && <p className="px-3 pt-3 pb-1.5 text-[11px] font-semibold tracking-widest text-faint uppercase">Actions</p>}
              <button
                id={`pi-${it.id}`}
                role="option"
                aria-selected={i === active}
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={it.run}
                className={cx("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left", i === active ? "bg-tint" : "")}
              >
                <span className={cx("grid size-8 place-items-center rounded-lg", i === active ? "bg-brand text-on-night" : "bg-canvas text-soft")}>{it.icon}</span>
                <span className="flex-1 font-medium">{it.label}</span>
                {it.detail && <span className="font-mono text-[13px] text-soft">{it.detail}</span>}
                {i === active && <CornerDownLeft className="size-4 text-soft" />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
