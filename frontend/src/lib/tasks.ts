import type { Priority, Status, Task } from "./api/types";

export const priorityLabels: Record<Priority, string> = {
  NONE: "없음",
  LOW: "낮음",
  MEDIUM: "보통",
  HIGH: "높음",
};

// 칸반 카드와 리스트 행은 최상위 할 일만 그린다. 하위 작업은 상세 패널에서 체크리스트로 보여 준다.
export function groupByStatus(tasks: Task[], statuses: Status[]): Map<number, Task[]> {
  const groups = new Map<number, Task[]>(statuses.map((s) => [s.id, []]));
  for (const task of tasks) {
    if (task.parentId === null) groups.get(task.statusId)?.push(task);
  }
  for (const list of groups.values()) {
    list.sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
  }
  return groups;
}

export function countSubtasks(tasks: Task[], statuses: Status[]): Map<number, { done: number; total: number }> {
  const doneIds = new Set(statuses.filter((s) => s.done).map((s) => s.id));
  const counts = new Map<number, { done: number; total: number }>();
  for (const task of tasks) {
    if (task.parentId === null) continue;
    const count = counts.get(task.parentId) ?? { done: 0, total: 0 };
    count.total += 1;
    if (doneIds.has(task.statusId)) count.done += 1;
    counts.set(task.parentId, count);
  }
  return counts;
}

// 체크박스 하나로 완료/미완료를 오간다: 완료면 첫 "완료" 상태로, 해제하면 첫 "미완료" 상태로 보낸다
export function toggleTargetStatus(task: Task, statuses: Status[]): Status | undefined {
  const current = statuses.find((s) => s.id === task.statusId);
  return current?.done ? statuses.find((s) => !s.done) : statuses.find((s) => s.done);
}

// 완료 상태는 이름 뒤에 "(완료)"를 붙여 구분한다. 이름에 이미 "완료"가 들어 있으면 그대로 둔다.
export function statusLabel(status: Status): string {
  return status.done && !status.name.includes("완료") ? `${status.name} (완료)` : status.name;
}

export function isDone(task: Task, statuses: Status[]): boolean {
  return statuses.find((s) => s.id === task.statusId)?.done ?? false;
}

// 화면에 그려진 순서에서 놓은 자리의 바로 위/아래 id를 구한다 (자기 자신은 뺀 목록 기준)
export function neighborsAt(ids: number[], index: number) {
  return { prevId: ids[index - 1] ?? null, nextId: ids[index] ?? null };
}

// 서버 응답이 오기 전에 화면 순서를 먼저 맞추기 위한 임시 순서값 (서버와 같은 간격 방식)
export function optimisticSortOrder(prev: number | undefined, next: number | undefined): number {
  if (prev === undefined && next === undefined) return 65536;
  if (prev === undefined) return next! / 2;
  if (next === undefined) return prev + 65536;
  return (prev + next) / 2;
}

const dateFormatter = new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric" });

export function todayString(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export type DueInfo = { label: string; tone: "overdue" | "today" | "normal" };

export function describeDue(dueDate: string | null, done: boolean): DueInfo | null {
  if (!dueDate) return null;
  const today = todayString();
  const [y, m, d] = dueDate.split("-").map(Number);
  const formatted = dateFormatter.format(new Date(y, m - 1, d));
  if (done) return { label: formatted, tone: "normal" };
  if (dueDate < today) return { label: `${formatted} (지남)`, tone: "overdue" };
  if (dueDate === today) return { label: "오늘까지", tone: "today" };
  return { label: formatted, tone: "normal" };
}
