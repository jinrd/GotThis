"use client";

import { useQuery, type QueryClient } from "@tanstack/react-query";
import { fieldApi, statusApi, tagApi, taskApi, taskListApi } from "@/lib/api/endpoints";
import type { Task, TaskFilter } from "@/lib/api/types";

// 쿼리 키를 한곳에 모아 두면 무효화(invalidate)할 범위를 실수 없이 지정할 수 있다
export const queryKeys = {
  taskLists: ["taskLists"] as const,
  statuses: (listId: number) => ["statuses", listId] as const,
  tasksAll: (listId: number) => ["tasks", listId] as const,
  tasks: (listId: number, filter: TaskFilter) => ["tasks", listId, filter] as const,
  task: (listId: number, taskId: number) => ["task", listId, taskId] as const,
  subtasks: (listId: number, taskId: number) => ["subtasks", listId, taskId] as const,
  fields: (listId: number) => ["fields", listId] as const,
  tags: ["tags"] as const,
};

const bySortOrder = <T extends { sortOrder: number; id: number }>(a: T, b: T) =>
  a.sortOrder - b.sortOrder || a.id - b.id;

export function useTaskLists() {
  return useQuery({
    queryKey: queryKeys.taskLists,
    queryFn: taskListApi.list,
    select: (lists) => [...lists].sort(bySortOrder),
  });
}

export function useStatuses(listId: number) {
  return useQuery({
    queryKey: queryKeys.statuses(listId),
    queryFn: () => statusApi.list(listId),
    select: (statuses) => [...statuses].sort(bySortOrder),
  });
}

export function useTasks(listId: number, filter: TaskFilter) {
  return useQuery({
    queryKey: queryKeys.tasks(listId, filter),
    queryFn: () => taskApi.list(listId, filter),
    // 필터를 바꾸는 동안 이전 결과를 보여 줘서 화면이 깜빡이지 않게 한다
    placeholderData: (previous) => previous,
  });
}

export function useTask(listId: number, taskId: number | null) {
  return useQuery({
    queryKey: queryKeys.task(listId, taskId ?? 0),
    queryFn: () => taskApi.get(listId, taskId!),
    enabled: taskId !== null,
  });
}

export function useSubtasks(listId: number, taskId: number | null) {
  return useQuery({
    queryKey: queryKeys.subtasks(listId, taskId ?? 0),
    queryFn: () => taskApi.subtasks(listId, taskId!),
    enabled: taskId !== null,
    select: (tasks) => [...tasks].sort(bySortOrder),
  });
}

export function useFields(listId: number) {
  return useQuery({
    queryKey: queryKeys.fields(listId),
    queryFn: () => fieldApi.list(listId),
    select: (fields) => [...fields].sort(bySortOrder),
  });
}

export function useTags() {
  return useQuery({ queryKey: queryKeys.tags, queryFn: tagApi.list });
}

// 서버가 돌려준 Task 하나로 이 목록의 모든 캐시(필터별 목록, 상세, 하위 작업)를 맞춘다
export function syncTask(qc: QueryClient, listId: number, task: Task) {
  qc.setQueriesData<Task[]>({ queryKey: queryKeys.tasksAll(listId) }, (tasks) =>
    tasks?.map((t) => (t.id === task.id ? task : t)),
  );
  qc.setQueryData(queryKeys.task(listId, task.id), task);
  if (task.parentId !== null) {
    qc.setQueryData<Task[]>(queryKeys.subtasks(listId, task.parentId), (tasks) =>
      tasks?.map((t) => (t.id === task.id ? task : t)),
    );
  }
}

// 필터 결과는 서버가 판단하므로, 추가/삭제/상태 변경 뒤에는 목록을 다시 받아 온다
export function invalidateTasks(qc: QueryClient, listId: number) {
  return Promise.all([
    qc.invalidateQueries({ queryKey: queryKeys.tasksAll(listId) }),
    qc.invalidateQueries({ queryKey: ["subtasks", listId] }),
  ]);
}
