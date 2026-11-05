"use client";

import { Dialog } from "@/components/ui/dialog";

export const shortcuts = [
  { keys: ["N"], description: "새 할 일 추가" },
  { keys: ["/"], description: "검색하기" },
  { keys: ["Esc"], description: "열린 창이나 상세 닫기" },
  { keys: ["?"], description: "단축키 보기" },
] as const;

export function ShortcutsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} title="단축키">
      <ul className="divide-y divide-line">
        {shortcuts.map((shortcut) => (
          <li key={shortcut.description} className="flex items-center justify-between py-3 text-base">
            <span>{shortcut.description}</span>
            <span className="flex gap-1">
              {shortcut.keys.map((key) => (
                <kbd key={key} className="min-w-8 rounded-md border border-line-strong bg-subtle px-2 py-0.5 text-center text-sm font-medium">
                  {key}
                </kbd>
              ))}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-fg-muted">입력칸에 글을 쓰는 중에는 단축키가 동작하지 않아요.</p>
    </Dialog>
  );
}
