"use client";

import { useState } from "react";
import { ChevronDown, CircleCheck } from "lucide-react";
import type { Status, Task } from "@/lib/api/types";
import { AddTask } from "./add-task";
import { useListContext } from "./list-context";
import { StatusDropZone, TaskDnd } from "./task-dnd";
import { SortableTaskItem } from "./task-item";

type ViewProps = {
  groups: Map<number, Task[]>;
  addingStatusId: number | null;
  onAddingChange: (statusId: number | null) => void;
};

function StatusTitle({ status, count }: { status: Status; count: number }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span className="truncate font-semibold">{status.name}</span>
      {status.done && (
        <span className="inline-flex items-center gap-1 text-sm text-success">
          <CircleCheck className="size-4" aria-hidden />
          <span className="sr-only">완료 상태</span>
        </span>
      )}
      <span className="text-sm text-fg-muted" aria-label={`${count}개`}>
        {count}
      </span>
    </span>
  );
}

// 리스트 뷰: 상태별 묶음을 위아래로 쌓는다. 묶음은 접을 수 있다.
export function ListView({ groups, addingStatusId, onAddingChange }: ViewProps) {
  const { statuses } = useListContext();
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  const toggle = (id: number) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <TaskDnd groups={groups} variant="row">
      {(view) => (
        <div className="safe-bottom mx-auto w-full max-w-4xl space-y-5 px-4 pt-3 sm:space-y-6 sm:py-4 md:px-6">
          {statuses.map((status) => {
            const tasks = view.get(status.id) ?? [];
            const isCollapsed = collapsed.has(status.id);
            return (
              <section key={status.id} aria-label={status.name}>
                <h2>
                  <button
                    type="button"
                    onClick={() => toggle(status.id)}
                    aria-expanded={!isCollapsed}
                    className="flex min-h-11 w-full sm:min-h-10 items-center gap-2 rounded-lg px-1 text-left text-base hover:bg-subtle"
                  >
                    <ChevronDown className={`size-5 text-fg-muted transition ${isCollapsed ? "-rotate-90" : ""}`} aria-hidden />
                    <StatusTitle status={status} count={tasks.length} />
                  </button>
                </h2>
                {!isCollapsed && (
                  <div className="mt-2 overflow-hidden rounded-xl border border-line bg-surface">
                    <StatusDropZone statusId={status.id} taskIds={tasks.map((t) => t.id)} className="min-h-2">
                      {tasks.map((task) => (
                        <SortableTaskItem key={task.id} task={task} variant="row" />
                      ))}
                    </StatusDropZone>
                    <div className="p-1">
                      <AddTask
                        statusId={status.id}
                        active={addingStatusId === status.id}
                        onActiveChange={(active) => onAddingChange(active ? status.id : null)}
                      />
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </TaskDnd>
  );
}

// 보드(칸반) 뷰: 상태가 열이 된다. 좁은 화면에서는 가로로 넘겨 본다.
export function BoardView({ groups, addingStatusId, onAddingChange }: ViewProps) {
  const { statuses } = useListContext();
  return (
    <TaskDnd groups={groups} variant="card">
      {(view) => (
        <div className="flex min-h-0 flex-1 snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto overscroll-x-contain px-4 py-4 md:scroll-px-6 md:px-6">
          {statuses.map((status) => {
            const tasks = view.get(status.id) ?? [];
            return (
              <section
                key={status.id}
                aria-label={status.name}
                className="flex max-h-full w-[calc(100vw-3.5rem)] shrink-0 snap-start flex-col rounded-2xl bg-subtle sm:w-80"
              >
                <h2 className="px-4 pt-3 pb-2 text-base">
                  <StatusTitle status={status} count={tasks.length} />
                </h2>
                <StatusDropZone
                  statusId={status.id}
                  taskIds={tasks.map((t) => t.id)}
                  className="min-h-16 flex-1 space-y-2 overflow-y-auto rounded-xl px-2 pb-2"
                >
                  {tasks.map((task) => (
                    <SortableTaskItem key={task.id} task={task} variant="card" />
                  ))}
                  {tasks.length === 0 && (
                    <p className="rounded-xl border border-dashed border-line-strong px-3 py-4 text-center text-sm text-fg-muted">
                      비어 있어요
                    </p>
                  )}
                </StatusDropZone>
                <div className="px-2 pb-2">
                  <AddTask
                    statusId={status.id}
                    active={addingStatusId === status.id}
                    onActiveChange={(active) => onAddingChange(active ? status.id : null)}
                  />
                </div>
              </section>
            );
          })}
        </div>
      )}
    </TaskDnd>
  );
}
