"use client";

import { createContext, useContext } from "react";
import type { Status, Task } from "@/lib/api/types";
import type { TaskActions } from "@/hooks/use-task-actions";

// 목록 화면 안의 카드·행·상세 패널이 함께 쓰는 값. props를 여러 단계로 내려보내지 않으려고 둔다.
export type ListContextValue = {
  listId: number;
  statuses: Status[];
  actions: TaskActions;
  subtaskCounts: Map<number, { done: number; total: number }>;
  // 필터가 걸려 있으면 화면의 앞뒤 카드가 서버의 실제 이웃이 아닐 수 있어서 드래그를 막는다
  dragDisabled: boolean;
  openTask: (taskId: number) => void;
  requestDelete: (task: Task) => void;
};

export const ListContext = createContext<ListContextValue | null>(null);

export function useListContext(): ListContextValue {
  const value = useContext(ListContext);
  if (!value) throw new Error("useListContext는 ListContext 안에서만 쓸 수 있어요.");
  return value;
}
