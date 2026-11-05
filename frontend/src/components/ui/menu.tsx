"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";
import { IconButton } from "./button";

export type MenuItem =
  | {
      label: string;
      icon?: ReactNode;
      onSelect: () => void;
      danger?: boolean;
      disabled?: boolean;
    }
  | { separator: true; label?: string };

// 모든 항목의 "⋯" 메뉴. 드래그나 hover를 몰라도 이 버튼 하나로 모든 기능에 닿게 한다.
export function Menu({ label, items, trigger }: { label: string; items: MenuItem[]; trigger?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  // 스크롤 영역 안에 있어도 잘리지 않게 화면 기준(fixed)으로 띄운다
  useLayoutEffect(() => {
    if (!open || !buttonRef.current || !listRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menu = listRef.current.getBoundingClientRect();
    const left = Math.max(8, Math.min(rect.right - menu.width, window.innerWidth - menu.width - 8));
    const below = rect.bottom + 4;
    const top = below + menu.height > window.innerHeight - 8 ? Math.max(8, rect.top - menu.height - 4) : below;
    setPosition({ top, left });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLButtonElement>("[role=menuitem]:not([disabled])")?.focus();
    const close = (e: MouseEvent) => {
      if (!listRef.current?.contains(e.target as Node) && !buttonRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const closeMenu = () => setOpen(false);
    document.addEventListener("mousedown", close);
    window.addEventListener("resize", closeMenu);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("resize", closeMenu);
    };
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const buttons = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>("[role=menuitem]:not([disabled])") ?? [],
    );
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "Escape") {
      e.stopPropagation();
      setOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      buttons[(index + 1) % buttons.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      buttons[(index - 1 + buttons.length) % buttons.length]?.focus();
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <>
      <IconButton
        ref={buttonRef}
        label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {trigger ?? <MoreHorizontal className="size-5" aria-hidden />}
      </IconButton>
      {open &&
        createPortal(
          <div
            ref={listRef}
            id={menuId}
            role="menu"
            aria-label={label}
            onKeyDown={onKeyDown}
            onClick={(e) => e.stopPropagation()}
            style={{ top: position?.top ?? -9999, left: position?.left ?? -9999 }}
            className="fixed z-50 max-h-[70vh] min-w-52 overflow-y-auto rounded-xl border border-line bg-surface p-1 text-fg shadow-xl"
          >
            {items.map((item, i) =>
              "separator" in item ? (
                <div key={`sep-${i}`} role="separator" className="my-1 border-t border-line">
                  {item.label && <p className="px-3 pt-2 pb-1 text-xs font-medium text-fg-muted">{item.label}</p>}
                </div>
              ) : (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    setOpen(false);
                    item.onSelect();
                  }}
                  className={`flex min-h-10 w-full items-center gap-2.5 rounded-lg px-3 text-left text-base hover:bg-subtle focus:bg-subtle focus:outline-none disabled:opacity-40 ${
                    item.danger ? "text-danger" : ""
                  }`}
                >
                  {item.icon && <span className="grid size-5 place-items-center" aria-hidden>{item.icon}</span>}
                  {item.label}
                </button>
              ),
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
