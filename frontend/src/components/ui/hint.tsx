"use client";

import { useState, type ReactNode } from "react";
import { Lightbulb, X } from "lucide-react";
import { readStorage, storageKeys, writeStorage } from "@/lib/storage";

// 기능을 처음 만났을 때 한 번만 보여 주는 안내. 닫으면 다시 나오지 않는다.
export function Hint({ name, children }: { name: string; children: ReactNode }) {
  const [visible, setVisible] = useState(() => readStorage(storageKeys.hint(name)) === null);
  if (!visible) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-line bg-accent-soft px-4 py-3 text-sm text-fg">
      <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
      <p className="flex-1 leading-relaxed">{children}</p>
      <button
        type="button"
        onClick={() => {
          writeStorage(storageKeys.hint(name), "seen");
          setVisible(false);
        }}
        className="-my-1 -mr-2 grid size-8 shrink-0 place-items-center rounded-md text-fg-muted hover:bg-subtle"
        aria-label="안내 닫기"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}
