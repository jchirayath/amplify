export type Base = "BU" | "BD" | "BI" | "BO";

/** One eye's correction. Powers are dioptres in 0.25 steps; axis is whole degrees 1–180. */
export interface Eye {
  sph: number;
  cyl: number;
  axis: number | null; // null when cyl is 0
  prism: number;
  base: Base | null; // null when prism is 0
  add: number | null; // null for single-vision
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dob: string; // YYYY-MM-DD
  email: string;
  phone: string;
}

export interface Scan {
  name: string;
  /** Image URL: a data URL for uploads, a bundled file for sample data. Null when an upload was too large to keep. */
  src: string | null;
}

/** A saved prescription. Never edited in place: a correction is a new prescription. */
export interface Prescription {
  id: string;
  patientId: string;
  issuedAt: string; // ISO date-time
  expiresAt: string; // ISO date-time
  od: Eye; // right eye
  os: Eye; // left eye
  pd: number; // pupillary distance, mm
  prescriber: string;
  notes: string;
  scan: Scan | null;
}

export interface Settings {
  practiceName: string;
  prescriber: string;
  userName: string;
  validityYears: number;
}

export interface DemoState {
  version: 1;
  signedIn: boolean;
  patients: Patient[];
  prescriptions: Prescription[];
  settings: Settings;
}
