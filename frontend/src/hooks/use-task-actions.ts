"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taskApi, type Neighbors, type TaskUpdateBody } from "@/lib/api/endpoints";
import type { PropertyValue, Status, Task } from "@/lib/api/types";
import { errorMessage, hasErrorCode } from "@/lib/errors";
import { toggleTargetStatus } from "@/lib/tasks";
import { useToast } from "@/components/ui/toast";
import { invalidateTasks, queryKeys, syncTask } from "./queries";

// 화면에 먼저 반영할 변경 (서버 응답이 오면 그 값으로 덮어쓴다)
type Patch = Partial<Pick<Task, "statusId" | "sortOrder">>;

export function useTaskActions(listId: number, statuses: Status[]) {
  const qc = useQueryClient();
  const toast = useToast();

  // 낙관적 업데이트: 필터별 목록 캐시와 하위 작업 캐시를 모두 고친다
  const patchCaches = async (taskId: number, patch: Patch) => {
    await qc.cancelQueries({ queryKey: queryKeys.tasksAll(listId) });
    const apply = (tasks: Task[] | undefined) => tasks?.map((t) => (t.id === taskId ? { ...t, ...patch } : t));
    qc.setQueriesData<Task[]>({ queryKey: queryKeys.tasksAll(listId) }, apply);
    qc.setQueriesData<Task[]>({ queryKey: ["subtasks", listId] }, apply);
    qc.setQueryData<Task>(queryKeys.task(listId, taskId), (t) => (t ? { ...t, ...patch } : t));
  };

  const onFailure = (err: unknown) => {
    toast.error(errorMessage(err));
    void invalidateTasks(qc, listId);
  };

  const create = useMutation({
    mutationFn: (body: { title: string; statusId?: number; parentId?: number }) => taskApi.create(listId, body),
    onError: onFailure,
    onSuccess: () => invalidateTasks(qc, listId),
  });

  // 상태 변경은 서버에서 "새 상태의 맨 뒤"로 간다. 화면에서도 맨 뒤로 먼저 옮겨 둔다.
  const changeStatus = useMutation({
    mutationFn: ({ task, statusId }: { task: Task; statusId: number }) =>
      taskApi.update(listId, task.id, { statusId }),
    onMutate: ({ task, statusId }) => patchCaches(task.id, { statusId, sortOrder: Number.MAX_SAFE_INTEGER }),
    onError: onFailure,
    onSuccess: (task) => {
      syncTask(qc, listId, task);
      void invalidateTasks(qc, listId);
    },
  });

  const toggleDone = (task: Task) => {
    const target = toggleTargetStatus(task, statuses);
    if (target) changeStatus.mutate({ task, statusId: target.id });
  };

  const move = useMutation({
    mutationFn: ({ taskId, statusId, neighbors }: { taskId: number; statusId: number; neighbors: Neighbors; sortOrder: number }) =>
      taskApi.move(listId, taskId, statusId, neighbors),
    onMutate: ({ taskId, statusId, sortOrder }) => patchCaches(taskId, { statusId, sortOrder }),
    onError: (err) => {
      // 앞뒤 항목이 서버와 달라졌다면(다른 탭에서 바뀜 등) 다시 불러오는 것으로 충분하다
      if (hasErrorCode(err, "INVALID_MOVE_TARGET")) toast.info(errorMessage(err));
      else toast.error(errorMessage(err));
      void invalidateTasks(qc, listId);
    },
    // 간격이 바닥나 서버가 열 전체를 재정렬했을 수 있으므로 목록을 다시 받는다
    onSuccess: () => invalidateTasks(qc, listId),
  });

  const update = useMutation({
    mutationKey: ["task-save"],
    mutationFn: ({ taskId, body }: { taskId: number; body: TaskUpdateBody }) => taskApi.update(listId, taskId, body),
    onError: onFailure,
    onSuccess: (task) => syncTask(qc, listId, task),
  });

  const updateProperties = useMutation({
    mutationKey: ["task-save"],
    mutationFn: ({ taskId, values }: { taskId: number; values: Record<string, PropertyValue | null> }) =>
      taskApi.updateProperties(listId, taskId, values),
    onError: onFailure,
    onSuccess: (task) => syncTask(qc, listId, task),
  });

  const setTag = useMutation({
    mutationKey: ["task-save"],
    mutationFn: ({ taskId, tagId, attached }: { taskId: number; tagId: number; attached: boolean }) =>
      attached ? taskApi.addTag(listId, taskId, tagId) : taskApi.removeTag(listId, taskId, tagId),
    onError: onFailure,
    onSuccess: (task) => syncTask(qc, listId, task),
  });

  const remove = useMutation({
    mutationFn: (task: Task) => taskApi.remove(listId, task.id),
    onError: onFailure,
    onSuccess: (_, task) => {
      qc.removeQueries({ queryKey: queryKeys.task(listId, task.id) });
      toast.info("할 일을 지웠어요.");
      void invalidateTasks(qc, listId);
    },
  });

  return { create, changeStatus, toggleDone, move, update, updateProperties, setTag, remove };
}

export type TaskActions = ReturnType<typeof useTaskActions>;
