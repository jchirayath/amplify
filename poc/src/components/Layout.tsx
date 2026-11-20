import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { FilePlus2, Home, LogOut, Search, Settings, Users } from "lucide-react";
import { initials, useStore } from "../lib/store";
import CommandPalette from "./CommandPalette";
import { DemoTag, cx } from "./ui";
import { Logo } from "./Logo";

const NAV = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/patients", label: "Patients", icon: Users },
  { to: "/rx/new", label: "New Rx", icon: FilePlus2 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

export default function Layout() {
  const { state, signOut } = useStore();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const navigate = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);

  const me = { firstName: state.settings.userName, lastName: state.settings.prescriber.split(" ").pop() ?? "" };

  return (
    <div className="min-h-full md:pl-60">
      {/* Desktop rail */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col bg-night px-4 py-6 text-on-night md:flex print:hidden">
        <div className="flex items-center gap-2.5 px-2">
          <Logo className="size-8" />
          <span className="text-lg font-bold tracking-tight">Amplify Rx</span>
        </div>
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="mt-7 flex items-center gap-2 rounded-xl border border-night-2 bg-[#132f37] px-3 py-2.5 text-left text-[15px] text-on-night-soft transition-colors hover:border-[#2d6470] hover:text-on-night"
        >
          <Search className="size-4" />
          <span className="flex-1">Search</span>
          <kbd className="rounded-md border border-night-2 px-1.5 font-mono text-[11px]">{isMac ? "⌘K" : "Ctrl K"}</kbd>
        </button>
        <nav className="mt-5 flex flex-col gap-1" aria-label="Main">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cx("flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors",
                  isActive ? "bg-night-2 text-on-night" : "text-on-night-soft hover:bg-[#163a43] hover:text-on-night")}
            >
              <Icon className="size-[18px]" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto space-y-4">
          <div className="rounded-xl border border-night-2 p-3 text-[13px] leading-snug text-on-night-soft">
            <DemoTag className="mb-1.5 inline-block" />
            <p>Sample patients only. Data stays in this browser.</p>
          </div>
          <div className="flex items-center gap-3 px-1">
            <span className="grid size-9 place-items-center rounded-full bg-accent font-bold text-night">{initials(me)}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{state.settings.prescriber}</p>
              <p className="truncate text-xs text-on-night-soft">{state.settings.practiceName}</p>
            </div>
            <button
              type="button"
              onClick={() => { signOut(); navigate("/signin"); }}
              className="rounded-lg p-2 text-on-night-soft hover:bg-night-2 hover:text-on-night"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-night px-4 py-3 text-on-night md:hidden print:hidden">
        <div className="flex items-center gap-2"><Logo className="size-7" /><span className="font-bold">Amplify Rx</span><DemoTag /></div>
        <button type="button" onClick={() => setPaletteOpen(true)} className="rounded-lg p-2 hover:bg-night-2" aria-label="Search"><Search className="size-5" /></button>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-6 pb-28 md:px-10 md:pt-10 md:pb-16">
        <Outlet />
      </main>

      {/* Mobile tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-panel md:hidden print:hidden" aria-label="Main">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => cx("flex flex-col items-center gap-1 py-2.5 text-[12px] font-medium", isActive ? "text-brand" : "text-soft")}>
            <Icon className="size-5" />{label}
          </NavLink>
        ))}
      </nav>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
