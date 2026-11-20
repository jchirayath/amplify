import { describe, expect, it } from "vitest";
import { compareRx, emptyDraft, fmtPower, parseNumber, validate, type RxDraft } from "./rx";
import { makeSeed } from "./seed";
import type { Eye } from "./types";

const eye = (o: Partial<Eye> = {}): Eye => ({ sph: -2, cyl: -0.5, axis: 90, prism: 0, base: null, add: null, ...o });
const draft = (o: Partial<RxDraft["od"]> = {}, os: Partial<RxDraft["os"]> = {}, pd = "62"): RxDraft => ({
  ...emptyDraft(),
  od: { sph: "-2.00", cyl: "-0.50", axis: "90", prism: "", base: "", add: "", ...o },
  os: { sph: "-2.00", cyl: "", axis: "", prism: "", base: "", add: "", ...os },
  pd,
});

describe("formatting", () => {
  it("signs powers and uses a typographic minus", () => {
    expect(fmtPower(1.25)).toBe("+1.25");
    expect(fmtPower(-0.5)).toBe("−0.50");
    expect(fmtPower(0)).toBe("0.00");
    expect(fmtPower(null)).toBe("–");
  });
  it("parses what people type", () => {
    expect(parseNumber("−1.25")).toBe(-1.25);
    expect(parseNumber("+2")).toBe(2);
    expect(parseNumber(".5")).toBe(0.5);
    expect(parseNumber("")).toBeNull();
    expect(parseNumber("abc")).toBeNull();
  });
});

describe("validate", () => {
  it("accepts a complete, sensible prescription", () => {
    const r = validate(draft());
    expect(r.value).not.toBeNull();
    expect(r.value?.os.cyl).toBe(0);
    expect(r.value?.os.axis).toBeNull();
  });
  it("requires SPH and PD", () => {
    const r = validate(draft({ sph: "" }, {}, ""));
    expect(r.errors["od.sph"]).toMatch(/required/);
    expect(r.errors.pd).toMatch(/required/);
    expect(r.value).toBeNull();
  });
  it("requires AXIS when CYL is not zero, and bounds it", () => {
    expect(validate(draft({ axis: "" })).errors["od.axis"]).toMatch(/required/);
    expect(validate(draft({ axis: "181" })).errors["od.axis"]).toMatch(/1 to 180/);
    expect(validate(draft({ axis: "45.5" })).errors["od.axis"]).toMatch(/whole number/);
  });
  it("enforces quarter-dioptre steps", () => {
    expect(validate(draft({ sph: "-2.10" })).errors["od.sph"]).toMatch(/0.25/);
  });
  it("needs a base direction when prism is set", () => {
    expect(validate(draft({ prism: "1.00" })).errors["od.base"]).toMatch(/BASE/);
    expect(validate(draft({ prism: "1.00", base: "BI" })).value?.od.base).toBe("BI");
  });
  it("warns when ADD is set for one eye only", () => {
    const r = validate(draft({ add: "+1.50" }));
    expect(r.value).not.toBeNull();
    expect(r.checks.some((c) => c.level === "warning" && /one eye/.test(c.message))).toBe(true);
  });
  it("warns on a big change since the last visit", () => {
    const prev = { od: eye({ sph: -1.25 }), os: eye({ cyl: 0, axis: null }) };
    const r = validate(draft(), { ...makeSeed().prescriptions[0], ...prev });
    expect(r.checks.some((c) => c.level === "warning" && /OD SPH/.test(c.message))).toBe(true);
  });
});

describe("compareRx", () => {
  it("labels changes and flags only large ones", () => {
    const c = compareRx({ od: eye(), os: eye() }, { od: eye({ sph: -2.25 }), os: eye({ sph: -3 }) });
    expect(c.map((x) => [x.label, x.significant])).toEqual([
      ["OD SPH −2.00 → −2.25", false],
      ["OS SPH −2.00 → −3.00", true],
    ]);
  });
  it("treats axis as circular", () => {
    const c = compareRx({ od: eye({ cyl: -1, axis: 178 }), os: eye() }, { od: eye({ cyl: -1, axis: 3 }), os: eye() });
    expect(c[0].significant).toBe(false);
  });
});

describe("seed", () => {
  it("produces valid prescriptions", () => {
    const s = makeSeed();
    expect(s.patients.length).toBeGreaterThan(10);
    for (const rx of s.prescriptions) {
      for (const e of [rx.od, rx.os]) {
        if (e.cyl !== 0) expect(e.axis).toBeGreaterThanOrEqual(1);
        if (e.prism > 0) expect(e.base).not.toBeNull();
      }
    }
  });
});
