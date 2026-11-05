"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { Task } from "@/lib/api/types";
import { isDone } from "@/lib/tasks";
import { useListContext } from "./list-context";
import { DoneCheckbox, DueBadge, PriorityBadge, SubtaskCount, TagChips, TaskMenu } from "./task-bits";

type Variant = "row" | "card";

// 리스트 행과 보드 카드가 같은 컴포넌트를 쓴다. 차이는 배치뿐이다.
export function SortableTaskItem({ task, variant }: { task: Task; variant: Variant }) {
  const { dragDisabled } = useListContext();
  const { setNodeRef, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: dragDisabled,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={isDragging ? "opacity-40" : undefined}
      // 마우스/터치로 끄는 동작만 여기서 받는다. 키보드 사용자는 ⋯ 메뉴로 옮긴다.
      {...listeners}
    >
      <TaskItemBody task={task} variant={variant} />
    </div>
  );
}

export function TaskItemBody({ task, variant, overlay }: { task: Task; variant: Variant; overlay?: boolean }) {
  const { statuses, openTask, dragDisabled, subtaskCounts } = useListContext();
  const done = isDone(task, statuses);
  const hasMeta = task.dueDate || task.priority !== "NONE" || task.tags.length > 0 || subtaskCounts.has(task.id);

  const shell =
    variant === "card"
      ? "rounded-xl border border-line bg-surface p-3 shadow-xs hover:border-line-strong"
      : "border-b border-line bg-surface px-3 py-2 hover:bg-subtle/60";

  return (
    <div
      className={`group relative flex items-start gap-2 sm:gap-3 ${shell} ${overlay ? "cursor-grabbing shadow-lg ring-2 ring-accent" : ""} ${
        dragDisabled ? "" : "cursor-grab active:cursor-grabbing"
      }`}
    >
      {!dragDisabled && variant === "row" && (
        <GripVertical
          className="absolute top-1/2 -left-0.5 hidden size-4 -translate-y-1/2 text-fg-muted opacity-0 group-hover:opacity-100 md:block"
          aria-hidden
        />
      )}
      <div className="pt-2.5 sm:pt-0.5">
        <DoneCheckbox task={task} />
      </div>
      <div className={`min-w-0 flex-1 ${variant === "row" ? "flex flex-col gap-1 md:flex-row md:items-center md:gap-4" : "space-y-2"}`}>
        <button
          type="button"
          onClick={() => openTask(task.id)}
          className={`min-h-11 text-left text-base leading-relaxed break-words [overflow-wrap:anywhere] sm:min-h-6 sm:leading-snug hover:underline md:flex-1 ${
            done ? "text-fg-muted line-through" : "text-fg"
          }`}
        >
          {task.title}
        </button>
        {(hasMeta || variant === "card") && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <DueBadge dueDate={task.dueDate} done={done} />
            <PriorityBadge priority={task.priority} />
            <SubtaskCount taskId={task.id} />
            <TagChips tags={task.tags} />
          </div>
        )}
      </div>
      <div className="-my-1 -mr-1" onPointerDown={(e) => e.stopPropagation()}>
        <TaskMenu task={task} />
      </div>
    </div>
  );
}
