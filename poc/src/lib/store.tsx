import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { addYears } from "./dates";
import { makeSeed } from "./seed";
import type { DemoState, Eye, Patient, Prescription, Scan, Settings } from "./types";

const KEY = "amplify-rx-demo/v1";

type Action =
  | { type: "signIn" }
  | { type: "signOut" }
  | { type: "addPatient"; patient: Patient }
  | { type: "addRx"; rx: Prescription }
  | { type: "settings"; settings: Partial<Settings> }
  | { type: "reset"; keepSession: boolean };

function reducer(s: DemoState, a: Action): DemoState {
  switch (a.type) {
    case "signIn": return { ...s, signedIn: true };
    case "signOut": return { ...s, signedIn: false };
    case "addPatient": return { ...s, patients: [...s.patients, a.patient] };
    case "addRx": return { ...s, prescriptions: [...s.prescriptions, a.rx] };
    case "settings": return { ...s, settings: { ...s.settings, ...a.settings } };
    case "reset": return { ...makeSeed(), signedIn: a.keepSession };
  }
}

function load(): DemoState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState;
      if (parsed?.version === 1 && Array.isArray(parsed.patients)) return parsed;
    }
  } catch { /* private window or corrupt data: start fresh */ }
  return makeSeed();
}

function save(s: DemoState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // Quota exceeded, most likely from an uploaded photo: keep the record, drop the large images.
    try {
      const slim = {
        ...s,
        prescriptions: s.prescriptions.map((r) =>
          r.scan?.src?.startsWith("data:") ? { ...r, scan: { ...r.scan, src: null } } : r),
      };
      localStorage.setItem(KEY, JSON.stringify(slim));
    } catch { /* storage unavailable; the session still works in memory */ }
  }
}

interface Api {
  state: DemoState;
  signIn(): void;
  signOut(): void;
  addPatient(p: Omit<Patient, "id">): Patient;
  addRx(input: { patientId: string; od: Eye; os: Eye; pd: number; notes: string; scan: Scan | null }): Prescription;
  updateSettings(s: Partial<Settings>): void;
  reset(): void;
  patient(id: string | undefined): Patient | undefined;
  rx(id: string | undefined): Prescription | undefined;
  /** Newest first. */
  history(patientId: string): Prescription[];
  latest(patientId: string): Prescription | undefined;
}

const Ctx = createContext<Api | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => save(state), [state]);

  const api = useMemo<Api>(() => {
    const history = (patientId: string) =>
      state.prescriptions
        .filter((r) => r.patientId === patientId)
        .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
    return {
      state,
      signIn: () => dispatch({ type: "signIn" }),
      signOut: () => dispatch({ type: "signOut" }),
      addPatient(p) {
        const patient = { ...p, id: crypto.randomUUID() };
        dispatch({ type: "addPatient", patient });
        return patient;
      },
      addRx(input) {
        const issuedAt = new Date().toISOString();
        const rx: Prescription = {
          ...input,
          id: crypto.randomUUID(),
          issuedAt,
          expiresAt: addYears(issuedAt, state.settings.validityYears),
          prescriber: state.settings.prescriber,
        };
        dispatch({ type: "addRx", rx });
        return rx;
      },
      updateSettings: (settings) => dispatch({ type: "settings", settings }),
      reset: () => dispatch({ type: "reset", keepSession: true }),
      patient: (id) => state.patients.find((p) => p.id === id),
      rx: (id) => state.prescriptions.find((r) => r.id === id),
      history,
      latest: (patientId) => history(patientId)[0],
    };
  }, [state]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useStore(): Api {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore outside StoreProvider");
  return v;
}

export const fullName = (p: Pick<Patient, "firstName" | "lastName">) => `${p.firstName} ${p.lastName}`;
export const initials = (p: Pick<Patient, "firstName" | "lastName">) => `${p.firstName[0] ?? ""}${p.lastName[0] ?? ""}`;
