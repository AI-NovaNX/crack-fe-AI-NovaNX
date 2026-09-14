"use client";

import { AlertCircle, CheckCircle2, WifiOff, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastVariant = "success" | "error" | "info";
type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};
type ToastItem = ToastInput & { id: number };

const ToastContext = createContext<((input: ToastInput) => void) | null>(null);

export function useToast() {
  const toast = useContext(ToastContext);
  if (!toast)
    throw new Error("useToast must be used within AppFeedbackProvider.");
  return toast;
}

function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const update = () => setIsOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-center text-sm font-bold text-slate-950 shadow-lg"
    >
      <WifiOff className="size-4" aria-hidden="true" />
      Anda sedang offline. Data terakhir tetap ditampilkan jika tersedia.
    </div>
  );
}

function Toast({ item, dismiss }: { item: ToastItem; dismiss: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(dismiss, 5000);
    return () => window.clearTimeout(timer);
  }, [dismiss]);

  const isError = item.variant === "error";
  const Icon = item.variant === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div
      role={isError ? "alert" : "status"}
      className="pointer-events-auto flex w-full items-start gap-3 rounded-2xl border border-palette-indigo-300-20 bg-card p-4 text-palette-slate-50 shadow-2xl"
    >
      <Icon
        className={`mt-0.5 size-5 shrink-0 ${isError ? "text-red-400" : "text-skyblue"}`}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="font-bold">{item.title}</p>
        {item.description ? (
          <p className="pt-1 text-sm leading-5 text-palette-slate-400">
            {item.description}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        aria-label="Tutup notifikasi"
        onClick={dismiss}
        className="rounded-full p-1 text-palette-slate-400 hover:bg-secondary hover:text-foreground"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function AppFeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  const showToast = useCallback((input: ToastInput) => {
    const id = nextId.current++;
    setToasts((current) => [...current.slice(-2), { ...input, id }]);
  }, []);
  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      <OfflineBanner />
      {children}
      <div
        aria-label="Notifikasi"
        className="pointer-events-none fixed right-4 bottom-4 z-[90] flex w-[min(420px,calc(100vw-2rem))] flex-col gap-3"
      >
        {toasts.map((item) => (
          <Toast key={item.id} item={item} dismiss={() => dismiss(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
