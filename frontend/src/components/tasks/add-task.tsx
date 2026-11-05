"use client";

import { useState, type KeyboardEvent } from "react";
import { Plus } from "lucide-react";
import { inputClass } from "@/components/ui/field";
import { useListContext } from "./list-context";

type AddTaskProps = {
  statusId?: number;
  active: boolean;
  onActiveChange: (active: boolean) => void;
  parentId?: number;
  label?: string;
};

// "+ 할 일 추가"를 누르면 입력칸이 되고, Enter로 추가한 뒤에도 열려 있어 연달아 적을 수 있다
export function AddTask({ statusId, active, onActiveChange, parentId, label = "할 일 추가" }: AddTaskProps) {
  const { actions } = useListContext();
  const [title, setTitle] = useState("");

  const submit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    actions.create.mutate({ title: trimmed, statusId, parentId });
    setTitle("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // 한글 조합 중 Enter는 글자 확정이므로 무시한다
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "Escape") {
      e.stopPropagation();
      setTitle("");
      onActiveChange(false);
    }
  };

  if (!active) {
    return (
      <button
        type="button"
        onClick={() => onActiveChange(true)}
        className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-base text-fg-muted hover:bg-subtle hover:text-fg"
      >
        <Plus className="size-5" aria-hidden />
        {label}
      </button>
    );
  }

  return (
    <div className="p-1">
      <input
        autoFocus
        value={title}
        maxLength={200}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => {
          if (!title.trim()) onActiveChange(false);
        }}
        aria-label={label}
        placeholder="무엇을 해야 하나요?"
        className={inputClass}
      />
      <p className="mt-1.5 px-1 text-sm text-fg-muted">
        <kbd className="font-medium">Enter</kbd>로 추가 · <kbd className="font-medium">Esc</kbd>로 닫기
      </p>
    </div>
  );
}
