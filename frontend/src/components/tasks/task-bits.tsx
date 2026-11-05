"use client";

import { ArrowRightLeft, CalendarDays, Check, Flag, ListChecks, PanelRightOpen, Trash2 } from "lucide-react";
import type { Priority, Status, TagSummary, Task } from "@/lib/api/types";
import { describeDue, priorityLabels, statusLabel } from "@/lib/tasks";
import { ColorDot } from "@/components/ui/color-picker";
import { Menu, type MenuItem } from "@/components/ui/menu";
import { useListContext } from "./list-context";

// 완료 체크박스. 목록에 "완료" 상태가 없으면 누를 수 없고, 이유를 알려 준다.
export function DoneCheckbox({ task, size = "md" }: { task: Task; size?: "md" | "sm" }) {
  const { statuses, actions } = useListContext();
  const done = statuses.find((s) => s.id === task.statusId)?.done ?? false;
  const canToggle = statuses.some((s) => s.done) && statuses.some((s) => !s.done);
  const box = size === "md" ? "size-6" : "size-5";

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      aria-label={done ? `${task.title} 완료 취소` : `${task.title} 완료`}
      title={canToggle ? undefined : "완료 상태가 없어요. 목록 설정 > 상태에서 만들 수 있어요."}
      disabled={!canToggle}
      onClick={(e) => {
        e.stopPropagation();
        actions.toggleDone(task);
      }}
      onPointerDown={(e) => e.stopPropagation()}
      className="-m-2 grid size-10 shrink-0 place-items-center rounded-lg disabled:cursor-not-allowed disabled:opacity-40"
    >
      <span
        className={`grid ${box} place-items-center rounded-full border-2 transition ${
          done ? "border-success bg-success text-surface" : "border-line-strong hover:border-fg-muted"
        }`}
      >
        {done && <Check className="size-3.5" strokeWidth={3} aria-hidden />}
      </span>
    </button>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  if (priority === "NONE") return null;
  const tone = priority === "HIGH" ? "text-danger" : "text-fg-muted";
  return (
    <span className={`inline-flex items-center gap-1 text-sm ${tone}`}>
      <Flag className="size-3.5" aria-hidden fill={priority === "HIGH" ? "currentColor" : "none"} />
      중요도 {priorityLabels[priority]}
    </span>
  );
}

export function DueBadge({ dueDate, done }: { dueDate: string | null; done: boolean }) {
  const due = describeDue(dueDate, done);
  if (!due) return null;
  const tone = due.tone === "overdue" ? "text-danger font-medium" : due.tone === "today" ? "text-accent font-medium" : "text-fg-muted";
  return (
    <span className={`inline-flex items-center gap-1 text-sm ${tone}`}>
      <CalendarDays className="size-3.5" aria-hidden />
      <span className="sr-only">마감일 </span>
      {due.label}
    </span>
  );
}

export function TagChips({ tags, max = 3 }: { tags: TagSummary[]; max?: number }) {
  if (tags.length === 0) return null;
  const shown = tags.slice(0, max);
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {shown.map((tag) => (
        <span key={tag.id} className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-xs text-fg">
          <ColorDot color={tag.color} className="size-2" />
          {tag.name}
        </span>
      ))}
      {tags.length > max && <span className="text-xs text-fg-muted">+{tags.length - max}</span>}
    </span>
  );
}

export function SubtaskCount({ taskId }: { taskId: number }) {
  const { subtaskCounts } = useListContext();
  const count = subtaskCounts.get(taskId);
  if (!count) return null;
  return (
    <span className="inline-flex items-center gap-1 text-sm text-fg-muted">
      <ListChecks className="size-3.5" aria-hidden />
      <span className="sr-only">하위 작업 </span>
      {count.done}/{count.total}
    </span>
  );
}

export function statusMoveItems(task: Task, statuses: Status[], onMove: (statusId: number) => void): MenuItem[] {
  const targets = statuses.filter((s) => s.id !== task.statusId);
  if (targets.length === 0) return [];
  return [
    { separator: true, label: "다른 상태로 옮기기" },
    ...targets.map((s) => ({
      label: statusLabel(s),
      icon: <ArrowRightLeft className="size-4" />,
      onSelect: () => onMove(s.id),
    })),
  ];
}

// 카드·행의 ⋯ 메뉴: 드래그 없이도 열기, 상태 옮기기, 지우기를 모두 할 수 있다
export function TaskMenu({ task }: { task: Task }) {
  const { statuses, actions, openTask, requestDelete } = useListContext();
  return (
    <Menu
      label={`${task.title} 메뉴`}
      items={[
        { label: "자세히 보기", icon: <PanelRightOpen className="size-4" />, onSelect: () => openTask(task.id) },
        ...statusMoveItems(task, statuses, (statusId) => actions.changeStatus.mutate({ task, statusId })),
        { separator: true },
        { label: "지우기", icon: <Trash2 className="size-4" />, danger: true, onSelect: () => requestDelete(task) },
      ]}
    />
  );
}
