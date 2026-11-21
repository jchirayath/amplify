# Amplify Rx: UI proof of concept

A front-end-only demo of the eyeglass prescription app, built for funding pitches. It runs
entirely in the browser on **fictional sample patients**. There is no backend, no cloud
account and nothing that can expire mid-pitch, and once loaded it works offline.

> **Not for real patient data.** Sign-in is simulated, records live in `localStorage`, and
> there are no security controls. The funded build replaces all of that (see "Not in the
> demo" below).

## Run it

You need **Node.js 20.19+ or 22.12+** (Vite 8's minimum). Check with `node -v`. Everything
runs from the `poc/` folder.

### 1. Get the code

```bash
git clone https://github.com/jchirayath/amplify.git
cd amplify
git checkout poc/ui-demo     # until this branch is merged
cd poc
npm install
```

### 2. Develop (live reload)

```bash
npm run dev                  # http://localhost:5173
```

### 3. Build and run the production build (use this for a pitch)

```bash
npm run build                # type-checks, then writes the static site to poc/dist
npm run preview              # serves poc/dist at http://localhost:4173
```

Open the printed URL and sign in with the pre-filled demo account. The build is fully static:
once the page has loaded, it keeps working with the network off.

### 4. Check it

```bash
npm test                     # unit tests for the validation and change-detection rules
npm run typecheck            # TypeScript only, no build
```

### Hosting the build

`dist/` uses relative paths and hash routing (`#/patients/...`), so any static host works,
including a subfolder, with no rewrite rules. Copy the contents of `poc/dist/` to the host, or
for a quick local share run `npx serve dist`. Opening `dist/index.html` straight from disk
(`file://`) is not supported, because browsers block module scripts there; serve it over HTTP.

### Before each pitch

- Run from the production build (step 3), not the dev server.
- Reset the sample data: Settings → Reset demo data, or ⌘K → "Reset demo data".
- Data is per browser, so rehearse in the browser you'll present from.

## The four-minute demo

1. **Sign in.** The demo account is pre-filled; either button works.
2. **Home.** Point out the amber *Expiring in 60 days* tile and the recall list.
3. **Find Maya Patel.** Press ⌘K (Ctrl K), type `maya`, press Enter. Show her history and
   the change chips between visits.
4. **New prescription.**
   - Type `-0.75` in OD CYL and tab past AXIS: the check fires ("AXIS is required…").
   - Click **Use the sample paper prescription**, then **Fill grid from photo**. The grid
     fills field by field, and the Checks panel flags *OD SPH −1.75 → −2.50* as a big
     change since the last visit.
   - Show **Copy OD to OS** and arrow-key stepping (±0.25).
   - **Save with 1 note.**
5. **Share.** Download the PDF (the print dialog's "Save as PDF") and open **Send secure link**.
6. **Reset.** Before the next pitch: Settings → Reset demo data, or ⌘K → "Reset demo data".

## What's real and what's simulated

| Area | In this demo |
|---|---|
| Rx entry grid, validation, change detection | Real logic (`src/lib/rx.ts`, unit-tested) |
| Patient search, history timeline, new patients | Real, stored in this browser |
| Printable prescription / PDF | Real, via the browser's print dialog |
| Attaching a photo | Real; stored as a data URL (very large images are dropped from storage) |
| "Fill grid from photo" | **Simulated**: fixed values for the bundled sample, last Rx −0.25 otherwise |
| Sign-in, Google button | **Simulated** |
| Secure link, send to lab | **Mocked**: nothing is sent |

## Clinical model (fixed from the 2023 demo)

- OD is the **right** eye and OS the left. The old schema had them swapped.
- SPH is required (0.00 for plano). The old form had no sphere field.
- CYL is optional (blank = DS). AXIS is required and must be 1–180 whenever CYL ≠ 0.
- PRISM needs a BASE direction (BU/BD/BI/BO).
- ADD is a power (+0.25 to +4.00), not yes/no.
- All powers come in 0.25 D steps and display with an explicit sign.
- Warnings, which never block saving: ADD on one eye only or differing between eyes, a SPH
  difference over 3.00 between eyes, and changes since the last visit over 0.50 D (or over 15°
  of axis on a cylinder of 0.75 or more).

## Layout

```
src/
  lib/       types, rx rules (+ tests), dates, seed data, store (localStorage)
  components Layout (rail, ⌘K palette), PowerInput, shared UI
  pages/     SignIn, Home, Patients, PatientDetail, NewRx, RxDetail, Settings
public/samples/  sample paper-Rx photo and scan placeholder (SVG)
```

Stack: Vite, React 18, TypeScript, Tailwind CSS 4, lucide icons, self-hosted DM Sans and
JetBrains Mono.

## Not in the demo (funded build)

Real authentication with MFA and roles, an encrypted server-side store with row-level
ownership, an audit log, HIPAA controls and a signed BAA, real OCR, real expiring share
links, and lab/practice-system integrations.

## Known limits

- On phones, the six-column entry grid scrolls sideways inside its card. Present on a
  laptop or tablet.
- Data is per browser. A different browser or a private window starts from the sample set.
