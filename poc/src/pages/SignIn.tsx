import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { useStore } from "../lib/store";
import { LensArt, Logo } from "../components/Logo";
import { Button, DemoTag, Field, inputCls } from "../components/ui";

export default function SignIn() {
  const { signIn } = useStore();
  const navigate = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState("demo@brightline.example");
  const [password, setPassword] = useState("demo-password");
  const [busy, setBusy] = useState<"form" | "google" | null>(null);

  const finish = (kind: "form" | "google") => {
    setBusy(kind);
    // A short pause so the demo feels like a real sign-in.
    setTimeout(() => {
      signIn();
      navigate((loc.state as { from?: string } | null)?.from ?? "/", { replace: true });
    }, 650);
  };
  const onSubmit = (e: FormEvent) => { e.preventDefault(); finish("form"); };

  return (
    <div className="grid min-h-full lg:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-night p-14 text-on-night lg:flex">
        <div className="flex items-center gap-3"><Logo className="size-10" /><span className="text-xl font-bold">Amplify Rx</span></div>
        <div>
          <LensArt className="mb-14 w-[min(520px,90%)]" />
          <h1 className="max-w-xl text-[44px] leading-[1.08] font-bold tracking-tight">Prescriptions captured once, checked as they’re typed, shared in a click.</h1>
          <p className="mt-5 max-w-lg text-lg text-on-night-soft">Built for independent optical practices.</p>
        </div>
        <p className="text-sm text-on-night-soft">Proof of concept · sample data only</p>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-2.5 lg:hidden"><Logo className="size-9" /><span className="text-lg font-bold">Amplify Rx</span></div>
          <div className="mb-2 flex items-center gap-2"><h2 className="text-[28px] font-bold tracking-tight">Welcome back</h2><DemoTag /></div>
          <p className="mb-8 text-soft">Sign in to your practice. The demo account is filled in for you.</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Email"><input className={inputCls} type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
            <Field label="Password"><input className={inputCls} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
            <Button type="submit" variant="primary" className="w-full py-3" disabled={busy !== null}>
              {busy === "form" ? <Loader2 className="size-4 animate-spin" /> : <>Sign in <ArrowRight className="size-4" /></>}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-[13px] text-faint"><span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" /></div>

          <Button className="w-full py-3" onClick={() => finish("google")} disabled={busy !== null}>
            {busy === "google" ? <Loader2 className="size-4 animate-spin" /> : (
              <>
                <svg viewBox="0 0 48 48" className="size-5" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
                Continue with Google
              </>
            )}
          </Button>
          <p className="mt-8 text-center text-[13px] text-faint">Both buttons sign in to the same demo account.</p>
        </div>
      </section>
    </div>
  );
}
