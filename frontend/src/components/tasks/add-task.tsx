"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Plus } from "lucide-react";
import { errorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/button";
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
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const trimmed = title.trim();
    if (!trimmed || actions.create.isPending) return;
    setError(null);
    actions.create.mutate({ title: trimmed, statusId, parentId }, {
      onSuccess: () => {
        setTitle("");
        requestAnimationFrame(() => inputRef.current?.focus());
      },
      onError: (err) => setError(errorMessage(err)),
    });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // 한글 조합 중 Enter는 글자 확정이므로 무시한다
    if (e.nativeEvent.isComposing) {
      if (e.key === "Enter") e.preventDefault();
      return;
    }
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
    <form className="space-y-3 p-2" onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <input
        ref={inputRef}
        data-autofocus
        autoFocus
        value={title}
        disabled={actions.create.isPending}
        enterKeyHint="done"
        maxLength={200}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={onKeyDown}
        aria-label={label}
        placeholder="무엇을 해야 하나요?"
        className={inputClass}
      />
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <div className="flex items-center justify-end gap-2">
        <span className="mr-auto hidden text-sm text-fg-muted sm:inline">Enter로 추가</span>
        <Button size="sm" variant="ghost" onClick={() => { setTitle(""); onActiveChange(false); }}>
          취소
        </Button>
        <Button type="submit" size="sm" variant="primary" disabled={!title.trim() || actions.create.isPending}>
          <Plus className="size-4" aria-hidden />
          {actions.create.isPending ? "추가 중…" : "추가"}
        </Button>
      </div>
    </form>
  );
}
