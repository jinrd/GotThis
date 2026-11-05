import { request, requestList, toQuery } from "./client";
import type {
  FieldDefinition,
  FieldType,
  Priority,
  PropertyValue,
  Status,
  Tag,
  Task,
  TaskFilter,
  TaskList,
  TokenResponse,
  UserResponse,
} from "./types";

// 이동 요청은 위치값 대신 "놓은 자리의 바로 앞/뒤 항목 id"를 보낸다 (백엔드 Phase 6 규칙)
export type Neighbors = { prevId: number | null; nextId: number | null };

export const authApi = {
  signup: (body: { email: string; password: string; nickname: string }) =>
    request<UserResponse>("POST", "/auth/signup", body),
  login: (body: { email: string; password: string }) =>
    request<TokenResponse>("POST", "/auth/login", body),
};

export const taskListApi = {
  list: () => requestList<TaskList>("GET", "/task-lists"),
  get: (id: number) => request<TaskList>("GET", `/task-lists/${id}`),
  create: (body: { name: string; color?: string }) =>
    request<TaskList>("POST", "/task-lists", body),
  update: (id: number, body: { name?: string; color?: string }) =>
    request<TaskList>("PATCH", `/task-lists/${id}`, body),
  move: (id: number, { prevId, nextId }: Neighbors) =>
    request<TaskList>("PATCH", `/task-lists/${id}/position`, {
      prevTaskListId: prevId,
      nextTaskListId: nextId,
    }),
  remove: (id: number) => request<void>("DELETE", `/task-lists/${id}`),
};

export const statusApi = {
  list: (listId: number) => requestList<Status>("GET", `/task-lists/${listId}/statuses`),
  create: (listId: number, body: { name: string; done?: boolean }) =>
    request<Status>("POST", `/task-lists/${listId}/statuses`, body),
  update: (listId: number, statusId: number, body: { name?: string; done?: boolean }) =>
    request<Status>("PATCH", `/task-lists/${listId}/statuses/${statusId}`, body),
  move: (listId: number, statusId: number, { prevId, nextId }: Neighbors) =>
    request<Status>("PATCH", `/task-lists/${listId}/statuses/${statusId}/position`, {
      prevStatusId: prevId,
      nextStatusId: nextId,
    }),
  remove: (listId: number, statusId: number) =>
    request<void>("DELETE", `/task-lists/${listId}/statuses/${statusId}`),
};

export type TaskCreateBody = {
  title: string;
  statusId?: number;
  parentId?: number;
  priority?: Priority;
  dueDate?: string;
};

export type TaskUpdateBody = {
  title?: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  clearDueDate?: boolean;
  statusId?: number;
};

export const taskApi = {
  list: (listId: number, filter: TaskFilter) =>
    requestList<Task>("GET", `/task-lists/${listId}/tasks${toQuery(filter)}`),
  get: (listId: number, taskId: number) =>
    request<Task>("GET", `/task-lists/${listId}/tasks/${taskId}`),
  subtasks: (listId: number, taskId: number) =>
    requestList<Task>("GET", `/task-lists/${listId}/tasks/${taskId}/subtasks`),
  create: (listId: number, body: TaskCreateBody) =>
    request<Task>("POST", `/task-lists/${listId}/tasks`, body),
  update: (listId: number, taskId: number, body: TaskUpdateBody) =>
    request<Task>("PATCH", `/task-lists/${listId}/tasks/${taskId}`, body),
  remove: (listId: number, taskId: number) =>
    request<void>("DELETE", `/task-lists/${listId}/tasks/${taskId}`),
  move: (listId: number, taskId: number, statusId: number, { prevId, nextId }: Neighbors) =>
    request<Task>("PATCH", `/task-lists/${listId}/tasks/${taskId}/position`, {
      statusId,
      prevTaskId: prevId,
      nextTaskId: nextId,
    }),
  addTag: (listId: number, taskId: number, tagId: number) =>
    request<Task>("PUT", `/task-lists/${listId}/tasks/${taskId}/tags/${tagId}`),
  removeTag: (listId: number, taskId: number, tagId: number) =>
    request<Task>("DELETE", `/task-lists/${listId}/tasks/${taskId}/tags/${tagId}`),
  updateProperties: (listId: number, taskId: number, values: Record<string, PropertyValue | null>) =>
    request<Task>("PATCH", `/task-lists/${listId}/tasks/${taskId}/properties`, { values }),
};

export const tagApi = {
  list: () => requestList<Tag>("GET", "/tags"),
  create: (body: { name: string; color?: string }) => request<Tag>("POST", "/tags", body),
  update: (tagId: number, body: { name?: string; color?: string; clearColor?: boolean }) =>
    request<Tag>("PATCH", `/tags/${tagId}`, body),
  remove: (tagId: number) => request<void>("DELETE", `/tags/${tagId}`),
};

export const fieldApi = {
  list: (listId: number) => requestList<FieldDefinition>("GET", `/task-lists/${listId}/fields`),
  create: (listId: number, body: { name: string; type: FieldType; options?: string[] }) =>
    request<FieldDefinition>("POST", `/task-lists/${listId}/fields`, body),
  update: (listId: number, fieldId: number, body: { name?: string; options?: string[] }) =>
    request<FieldDefinition>("PATCH", `/task-lists/${listId}/fields/${fieldId}`, body),
  remove: (listId: number, fieldId: number) =>
    request<void>("DELETE", `/task-lists/${listId}/fields/${fieldId}`),
};
