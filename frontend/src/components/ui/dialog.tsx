"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button, IconButton } from "./button";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "lg";
};

// 브라우저 기본 <dialog>를 쓴다. showModal()이 포커스 가두기, Esc 닫기, 배경 비활성화를 해 준다.
export function Dialog({ open, onClose, title, children, size = "sm" }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={(e) => {
        // React는 close 이벤트도 컴포넌트 트리를 따라 전파한다. 안쪽 다이얼로그가 닫힐 때 바깥까지 닫히지 않게 한다.
        if (e.target === e.currentTarget) onClose();
      }}
      onClick={(e) => {
        // 배경(다이얼로그 바깥)을 누르면 닫는다
        if (e.target === e.currentTarget) onClose();
      }}
      data-size={size}
      aria-label={title}
      className={`dialog-panel m-auto w-[calc(100%-2rem)] rounded-2xl border border-line bg-surface p-0 text-fg shadow-xl ${
        size === "lg" ? "max-w-2xl" : "max-w-md"
      }`}
    >
      {open && (
        <div className="flex max-h-[calc(100dvh-2rem)] flex-col sm:max-h-[85dvh]">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 className="min-w-0 break-words text-lg font-semibold">{title}</h2>
            <IconButton label="닫기" onClick={onClose}>
              <X className="size-5" aria-hidden />
            </IconButton>
          </div>
          <div className="safe-bottom min-h-0 overflow-y-auto overscroll-contain px-5 pt-4">{children}</div>
        </div>
      )}
    </dialog>
  );
}

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
  pending?: boolean;
};

// 지우기처럼 되돌릴 수 없는 동작 전에, 무엇이 사라지는지 분명히 알려 준다
export function ConfirmDialog({ open, title, description, confirmLabel, onConfirm, onClose, pending }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <div className="text-base leading-relaxed text-fg">{description}</div>
      <p className="mt-2 text-sm text-fg-muted">지운 뒤에는 되돌릴 수 없어요.</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button onClick={onClose}>취소</Button>
        <Button variant="danger" onClick={onConfirm} disabled={pending}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
