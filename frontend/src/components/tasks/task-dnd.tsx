"use client";

import { useState, type ReactNode } from "react";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Task } from "@/lib/api/types";
import { neighborsAt, optimisticSortOrder } from "@/lib/tasks";
import { useListContext } from "./list-context";
import { TaskItemBody } from "./task-item";

// 상태별 카드 id 배열. 드래그하는 동안에만 이 로컬 사본을 움직이고, 놓으면 서버에 한 번 보낸다.
type Columns = Map<number, number[]>;

const containerId = (statusId: number) => `status-${statusId}`;

function toColumns(groups: Map<number, Task[]>): Columns {
  return new Map([...groups].map(([statusId, tasks]) => [statusId, tasks.map((t) => t.id)]));
}

function findColumn(columns: Columns, id: UniqueIdentifier): number | null {
  if (typeof id === "string" && id.startsWith("status-")) return Number(id.slice(7));
  for (const [statusId, ids] of columns) {
    if (ids.includes(Number(id))) return statusId;
  }
  return null;
}

type TaskDndProps = {
  groups: Map<number, Task[]>;
  variant: "row" | "card";
  children: (groups: Map<number, Task[]>) => ReactNode;
};

export function TaskDnd({ groups, variant, children }: TaskDndProps) {
  const { actions } = useListContext();
  const [columns, setColumns] = useState<Columns | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    // 6px 이상 움직여야 드래그로 본다. 그보다 짧으면 평범한 클릭이다.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    // 터치는 길게 눌러야 드래그가 시작된다. 그래야 스크롤과 헷갈리지 않는다.
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 6 } }),
  );

  const taskById = new Map([...groups.values()].flat().map((t) => [t.id, t]));
  const current = columns ?? toColumns(groups);
  const view = new Map(
    [...current].map(([statusId, ids]) => [statusId, ids.map((id) => taskById.get(id)).filter((t): t is Task => !!t)]),
  );

  const onDragStart = ({ active }: DragStartEvent) => {
    setColumns(toColumns(groups));
    setActiveTask(taskById.get(Number(active.id)) ?? null);
  };

  // 다른 열 위로 넘어가면 로컬 사본에서 카드를 그 열로 옮긴다
  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    setColumns((prev) => {
      if (!prev) return prev;
      const from = findColumn(prev, active.id);
      const to = findColumn(prev, over.id);
      if (from === null || to === null || from === to) return prev;
      const next = new Map(prev);
      const fromIds = prev.get(from)!.filter((id) => id !== active.id);
      const toIds = [...prev.get(to)!];
      const overIndex = toIds.indexOf(Number(over.id));
      toIds.splice(overIndex >= 0 ? overIndex : toIds.length, 0, Number(active.id));
      next.set(from, fromIds);
      next.set(to, toIds);
      return next;
    });
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    const final = columns;
    setColumns(null);
    setActiveTask(null);
    if (!over || !final) return;

    const taskId = Number(active.id);
    const statusId = findColumn(final, taskId);
    if (statusId === null) return;

    let ids = final.get(statusId)!;
    const overIndex = ids.indexOf(Number(over.id));
    if (overIndex >= 0) ids = arrayMove(ids, ids.indexOf(taskId), overIndex);

    const index = ids.indexOf(taskId);
    const original = groups.get(statusId)?.map((t) => t.id) ?? [];
    const unchanged = original.length === ids.length && original.every((id, i) => id === ids[i]);
    if (unchanged) return;

    // 서버에는 "바로 위/아래 카드"를 보낸다. 자기 자신을 뺀 목록에서 놓은 자리의 앞뒤다.
    const others = ids.filter((id) => id !== taskId);
    const neighbors = neighborsAt(others, index);
    const sortOrder = optimisticSortOrder(
      neighbors.prevId === null ? undefined : taskById.get(neighbors.prevId)?.sortOrder,
      neighbors.nextId === null ? undefined : taskById.get(neighbors.nextId)?.sortOrder,
    );
    actions.move.mutate({ taskId, statusId, neighbors, sortOrder });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={() => {
        setColumns(null);
        setActiveTask(null);
      }}
    >
      {children(view)}
      <DragOverlay dropAnimation={null}>
        {activeTask && <TaskItemBody task={activeTask} variant={variant} overlay />}
      </DragOverlay>
    </DndContext>
  );
}

// 열(상태) 하나. 비어 있어도 카드를 놓을 수 있게 열 자체를 droppable로 등록한다.
export function StatusDropZone({ statusId, taskIds, className, children }: {
  statusId: number;
  taskIds: number[];
  className?: string;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: containerId(statusId) });
  return (
    <SortableContext id={containerId(statusId)} items={taskIds} strategy={verticalListSortingStrategy}>
      <div ref={setNodeRef} className={`${className ?? ""} ${isOver ? "bg-accent-soft/40" : ""}`}>
        {children}
      </div>
    </SortableContext>
  );
}
