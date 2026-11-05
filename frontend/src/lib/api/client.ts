import { readStorage, storageKeys, writeStorage } from "../storage";
import type { ApiError, ApiResponse } from "./types";

// 백엔드 ErrorCode를 그대로 들고 다니는 에러. 화면은 code로 분기한다.
export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: ApiError["fieldErrors"];

  constructor(status: number, error: ApiError) {
    super(error.message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = error.code;
    this.fieldErrors = error.fieldErrors;
  }
}

export function getToken(): string | null {
  return readStorage(storageKeys.token);
}

export function setToken(token: string | null): void {
  writeStorage(storageKeys.token, token);
}

// 토큰이 만료되면(401) 로그인 화면으로 보낸다. 레이아웃에서 등록한다.
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiRequestError(0, { code: "NETWORK_ERROR", message: "서버에 연결할 수 없어요." });
  }

  // 백엔드가 꺼져 있으면 프록시가 HTML 에러를 돌려줄 수 있어서 JSON 파싱을 방어한다
  const json = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !json?.success) {
    const error = json?.error ?? {
      code: response.status >= 500 ? "INTERNAL_SERVER_ERROR" : "UNKNOWN",
      message: "요청을 처리하지 못했어요.",
    };
    if (response.status === 401 && token) {
      setToken(null);
      onUnauthorized?.();
    }
    throw new ApiRequestError(response.status, error);
  }
  return json.data as T;
}

// ApiResponse가 @JsonInclude(NON_EMPTY)라서 빈 배열이면 data 자체가 빠져서 온다
export async function requestList<T>(method: Method, path: string, body?: unknown): Promise<T[]> {
  return (await request<T[] | undefined>(method, path, body)) ?? [];
}

export function toQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}
