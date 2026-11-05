// 백엔드 응답 DTO(record)를 그대로 옮긴 타입. 백엔드가 바뀌면 여기부터 고친다.

export type ApiFieldError = { field: string; reason: string };

export type ApiError = {
  code: string;
  message: string;
  fieldErrors?: ApiFieldError[];
};

// @JsonInclude(NON_EMPTY) 이므로 data/error는 없을 수 있다
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: ApiError;
};

export type TokenResponse = { accessToken: string; tokenType: string };
export type UserResponse = { id: number; email: string; nickname: string };

export type TaskList = {
  id: number;
  name: string;
  color: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type Status = {
  id: number;
  name: string;
  sortOrder: number;
  done: boolean;
};

export const priorities = ["NONE", "LOW", "MEDIUM", "HIGH"] as const;
export type Priority = (typeof priorities)[number];

export type TagSummary = { id: number; name: string; color: string | null };

export type Tag = TagSummary & { createdAt: string; updatedAt: string };

export type PropertyValue = string | number | boolean;

export type Task = {
  id: number;
  statusId: number;
  parentId: number | null;
  title: string;
  description: string | null;
  priority: Priority;
  dueDate: string | null; // yyyy-MM-dd
  sortOrder: number;
  tags: TagSummary[];
  properties: Record<string, PropertyValue>; // 키는 필드 정의 id 문자열
  createdAt: string;
  updatedAt: string;
};

export const fieldTypes = ["TEXT", "NUMBER", "DATE", "CHECKBOX", "SELECT"] as const;
export type FieldType = (typeof fieldTypes)[number];

export type FieldDefinition = {
  id: number;
  name: string;
  type: FieldType;
  options: string[];
  sortOrder: number;
};

export type TaskFilter = {
  statusId?: number;
  priority?: Priority;
  tagId?: number;
  keyword?: string;
  dueFrom?: string;
  dueTo?: string;
};
