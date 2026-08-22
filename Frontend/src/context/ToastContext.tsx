import React, { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, X, XCircle, Info, AlertTriangle } from "lucide-react";

type ToastKind = "success" | "error" | "info" | "warning";
interface Toast { id: number; kind: ToastKind; message: string; }

interface ToastCtx { push: (kind: ToastKind, message: string) => void; }
const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const icon = (k: ToastKind) => {
    const c = "h-5 w-5";
    if (k === "success") return <CheckCircle2 className={`${c} text-emerald-500`} />;
    if (k === "error") return <XCircle className={`${c} text-red-500`} />;
    if (k === "warning") return <AlertTriangle className={`${c} text-amber-500`} />;
    return <Info className={`${c} text-brand-500`} />;
  };

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[min(92vw,360px)]">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 30, scale: .95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: .95 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="card flex items-start gap-3 p-4 shadow-lg"
            >
              {icon(t.kind)}
              <p className="flex-1 text-sm text-slate-700 leading-relaxed">{t.message}</p>
              <button onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useToast outside provider");
  return c;
}
