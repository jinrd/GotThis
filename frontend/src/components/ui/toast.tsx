"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { CircleAlert, CircleCheck, X } from "lucide-react";

type ToastKind = "info" | "error";
type ToastItem = { id: number; kind: ToastKind; message: string };

type ToastApi = {
  info: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const push = useCallback(
    (kind: ToastKind, message: string) => {
      const id = nextId.current++;
      setItems((prev) => [...prev.slice(-2), { id, kind, message }]);
      // 에러는 읽을 시간을 더 준다
      window.setTimeout(() => dismiss(id), kind === "error" ? 6000 : 3000);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({ info: (m) => push("info", m), error: (m) => push("error", m) }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* 스크린 리더가 새 알림을 읽도록 live region으로 둔다 */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex flex-col items-center gap-2 px-4"
      >
        {items.map((item) => (
          <div
            key={item.id}
            role={item.kind === "error" ? "alert" : "status"}
            className="pointer-events-auto flex max-w-md items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-base text-fg shadow-lg"
          >
            {item.kind === "error" ? (
              <CircleAlert className="size-5 shrink-0 text-danger" aria-hidden />
            ) : (
              <CircleCheck className="size-5 shrink-0 text-success" aria-hidden />
            )}
            <span className="flex-1">{item.message}</span>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className="-mr-1 grid size-11 shrink-0 sm:size-8 place-items-center rounded-md text-fg-muted hover:bg-subtle"
              aria-label="알림 닫기"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast는 ToastProvider 안에서만 쓸 수 있어요.");
  return api;
}
