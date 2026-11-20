import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, Info } from "lucide-react";

interface Toast { id: number; message: string; tone: "success" | "info" }
const Ctx = createContext<(message: string, tone?: Toast["tone"]) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((message: string, tone: Toast["tone"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 print:hidden" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="animate-rise flex items-center gap-3 rounded-xl bg-night px-5 py-3.5 text-on-night shadow-pop">
            {t.tone === "success" ? <CheckCircle2 className="size-5 text-[#7FD1C7]" /> : <Info className="size-5 text-accent" />}
            <span className="text-[15px]">{t.message}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
