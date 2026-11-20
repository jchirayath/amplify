import { addYears, daysAgo } from "./dates";
import type { DemoState, Eye, Patient, Prescription, Settings } from "./types";

// Every patient here is fictional. Dates are relative to "now" so the
// expiring/recent counts look the same whenever the demo is reset.

export const SAMPLE_SCAN = "samples/scan-thumb.svg";
export const SAMPLE_PAPER_RX = "samples/paper-rx.svg";

/** What the simulated "read from photo" returns for the bundled sample paper Rx (Maya Patel’s new prescription). */
export const SAMPLE_PAPER_VALUES = {
  od: { sph: -2.5, cyl: -0.75, axis: 180, prism: 0, base: null, add: null },
  os: { sph: -2.0, cyl: -0.5, axis: 175, prism: 0, base: null, add: null },
  pd: 63,
} satisfies { od: Eye; os: Eye; pd: number };

export const DEFAULT_SETTINGS: Settings = {
  practiceName: "Brightline Optical",
  prescriber: "Dr. Alex Morgan",
  userName: "Alex",
  validityYears: 2,
};

const e = (sph: number, cyl = 0, axis: number | null = null, add: number | null = null, prism = 0, base: Eye["base"] = null): Eye => ({
  sph, cyl, axis: cyl === 0 ? null : axis, prism, base, add,
});

const PATIENTS: Array<Omit<Patient, "id" | "email" | "phone">> = [
  { firstName: "Maya", lastName: "Patel", dob: "1988-04-12" },
  { firstName: "Luis", lastName: "Romero", dob: "1961-09-03" },
  { firstName: "Grace", lastName: "Okafor", dob: "1995-01-22" },
  { firstName: "Tom", lastName: "Becker", dob: "1979-06-30" },
  { firstName: "Aiko", lastName: "Tanaka", dob: "1970-11-14" },
  { firstName: "Samuel", lastName: "Mensah", dob: "2001-03-08" },
  { firstName: "Elena", lastName: "Rossi", dob: "1984-07-19" },
  { firstName: "David", lastName: "Cohen", dob: "1955-12-02" },
  { firstName: "Priya", lastName: "Nair", dob: "1992-02-27" },
  { firstName: "Marcus", lastName: "Bell", dob: "1967-05-11" },
  { firstName: "Sofia", lastName: "Alvarez", dob: "2008-08-25" },
  { firstName: "Noah", lastName: "Fischer", dob: "1990-10-04" },
  { firstName: "Hannah", lastName: "Kim", dob: "1976-04-17" },
  { firstName: "Omar", lastName: "Haddad", dob: "1983-01-09" },
];

// [patient index, days ago, OD, OS, PD, has scan]
type Row = [number, number, Eye, Eye, number, boolean];
const HISTORY: Row[] = [
  [0, 900, e(-1.5, -0.75, 180), e(-1.5, -0.5, 175), 63, false],
  [0, 615, e(-1.75, -0.75, 180), e(-1.75, -0.5, 175), 63, true],
  [1, 5, e(1.0, -0.25, 90, 2.25), e(1.25, 0, null, 2.25), 64, false],
  [2, 740, e(-4.0, -1.25, 10), e(-4.25, -1.0, 165), 61, true],
  [2, 6, e(-4.5, -1.25, 10), e(-4.75, -1.0, 170), 61, true],
  [3, 700, e(-0.75), e(-1.0), 66, true],
  [4, 690, e(0.5, -0.5, 95, 2.0), e(0.75, -0.75, 85, 2.0), 60, true],
  [5, 20, e(-6.0, -2.0, 5, null, 0.5, "BI"), e(-5.5, -1.75, 175, null, 0.5, "BI"), 65, false],
  [6, 760, e(-2.5), e(-2.75), 62, true],
  [6, 1, e(-3.0), e(-3.25), 62, true],
  [7, 400, e(2.5, -0.75, 80, 2.5), e(2.25, -0.5, 100, 2.5), 63, true],
  [8, 3, e(-1.25, -0.5, 45), e(-1.0, -0.5, 135), 59, false],
  [9, 710, e(1.75, 0, null, 2.0), e(1.5, 0, null, 2.0), 67, true],
  [10, 150, e(-2.0), e(-2.25), 58, true],
  [11, 820, e(-0.5, -0.5, 180), e(-0.25, -0.5, 180), 64, true],
  [12, 735, e(-2.5, -0.5, 170), e(-2.5, -0.5, 10), 62, true],
  [12, 4, e(-2.75, -0.5, 170, 1.25), e(-2.5, -0.5, 10, 1.25), 62, true],
  [13, 250, e(0), e(-0.25), 65, true],
];

export function makeSeed(now = new Date()): DemoState {
  const patients: Patient[] = PATIENTS.map((p, i) => ({
    ...p,
    id: `p${String(i + 1).padStart(2, "0")}`,
    email: `${p.firstName.toLowerCase()}.${p.lastName.toLowerCase()}@example.com`,
    phone: `(312) 555-01${10 + i}`, // 555-01xx is reserved for fiction
  }));

  const prescriptions: Prescription[] = HISTORY.map(([pi, ago, od, os, pd, scan], i) => {
    const issuedAt = daysAgo(ago, now).toISOString();
    return {
      id: `rx${String(i + 1).padStart(3, "0")}`,
      patientId: patients[pi].id,
      issuedAt,
      expiresAt: addYears(issuedAt, DEFAULT_SETTINGS.validityYears),
      od, os, pd,
      prescriber: DEFAULT_SETTINGS.prescriber,
      notes: "",
      scan: scan ? { name: "paper-rx.jpg", src: SAMPLE_SCAN } : null,
    };
  });

  return { version: 1, signedIn: false, patients, prescriptions, settings: { ...DEFAULT_SETTINGS } };
}
