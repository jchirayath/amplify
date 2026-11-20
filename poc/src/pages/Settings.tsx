import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { useStore } from "../lib/store";
import { Button, Card, DemoTag, Field, Modal, PageHeader, inputCls } from "../components/ui";
import { useToast } from "../components/Toast";

export default function SettingsPage() {
  const { state, updateSettings, reset } = useStore();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  const s = state.settings;

  return (
    <>
      <PageHeader eyebrow="Settings" title="Practice settings" sub="Changes save automatically." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4 p-6">
          <h2 className="text-lg font-bold">Practice</h2>
          <Field label="Practice name" hint="Printed at the top of every prescription.">
            <input className={inputCls} value={s.practiceName} onChange={(e) => updateSettings({ practiceName: e.target.value })} />
          </Field>
          <Field label="Prescriber" hint="Signs new prescriptions.">
            <input className={inputCls} value={s.prescriber} onChange={(e) => updateSettings({ prescriber: e.target.value })} />
          </Field>
          <Field label="Your first name" hint="Used in the greeting on the home screen.">
            <input className={inputCls} value={s.userName} onChange={(e) => updateSettings({ userName: e.target.value })} />
          </Field>
          <Field label="Prescriptions are valid for">
            <select className={inputCls} value={s.validityYears} onChange={(e) => updateSettings({ validityYears: Number(e.target.value) })}>
              <option value={1}>1 year</option>
              <option value={2}>2 years</option>
            </select>
          </Field>
        </Card>

        <Card className="p-6">
          <div className="mb-2 flex items-center gap-2"><h2 className="text-lg font-bold">Demo data</h2><DemoTag /></div>
          <p className="mb-5 text-soft">Everything here is sample data stored in this browser only. Reset before each pitch so it starts clean.</p>
          <Button variant="danger" onClick={() => setConfirm(true)}><RotateCcw className="size-4" />Reset demo data</Button>
        </Card>
      </div>

      <Modal open={confirm} onClose={() => setConfirm(false)} title="Reset the demo?">
        <p className="text-soft">This restores the sample patients and removes anything added in this browser, including settings.</p>
        <div className="flex justify-end gap-2 pt-6">
          <Button onClick={() => setConfirm(false)} data-autofocus>Cancel</Button>
          <Button variant="danger" onClick={() => { reset(); setConfirm(false); toast("Demo reset to sample data", "info"); }}>Reset</Button>
        </div>
      </Modal>
    </>
  );
}
