import { ApiRequestError } from "./api/client";

// 백엔드 ErrorCode → 사용자가 읽을 문장. 없는 코드는 서버 메시지를 그대로 쓴다.
const friendlyMessages: Record<string, string> = {
  NETWORK_ERROR: "서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.",
  INTERNAL_SERVER_ERROR: "서버에 문제가 생겼어요. 잠시 후 다시 시도해 주세요.",
  DATA_CONFLICT: "다른 변경과 겹쳤어요. 다시 시도해 주세요.",
  INVALID_MOVE_TARGET: "다른 곳에서 순서가 바뀌었어요. 최신 상태로 다시 불러왔어요.",
  INVALID_CREDENTIALS: "이메일 또는 비밀번호가 맞지 않아요.",
  DUPLICATE_EMAIL: "이미 가입된 이메일이에요.",
  EXPIRED_TOKEN: "로그인이 만료됐어요. 다시 로그인해 주세요.",
  INVALID_TOKEN: "다시 로그인해 주세요.",
  UNAUTHORIZED: "다시 로그인해 주세요.",
  TASK_LIST_NOT_FOUND: "목록을 찾을 수 없어요. 이미 지워졌을 수 있어요.",
  TASK_NOT_FOUND: "할 일을 찾을 수 없어요. 이미 지워졌을 수 있어요.",
  STATUS_NOT_FOUND: "상태를 찾을 수 없어요. 이미 지워졌을 수 있어요.",
  TAG_NOT_FOUND: "태그를 찾을 수 없어요. 이미 지워졌을 수 있어요.",
  FIELD_NOT_FOUND: "필드를 찾을 수 없어요. 이미 지워졌을 수 있어요.",
  DUPLICATE_STATUS_NAME: "같은 이름의 상태가 이미 있어요.",
  DUPLICATE_TAG_NAME: "같은 이름의 태그가 이미 있어요.",
  DUPLICATE_FIELD_NAME: "같은 이름의 필드가 이미 있어요.",
  LAST_STATUS_CANNOT_BE_DELETED: "목록에는 상태가 하나 이상 있어야 해요.",
  STATUS_IN_USE: "할 일이 남아 있는 상태는 지울 수 없어요. 할 일을 먼저 옮겨 주세요.",
  SUBTASK_MOVE_NOT_SUPPORTED: "하위 작업은 아직 옮길 수 없어요.",
};

export function errorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.code === "INVALID_INPUT" && error.fieldErrors?.length) {
      return error.fieldErrors[0].reason;
    }
    return friendlyMessages[error.code] ?? error.message;
  }
  return "알 수 없는 문제가 생겼어요.";
}

export function hasErrorCode(error: unknown, code: string): boolean {
  return error instanceof ApiRequestError && error.code === code;
}
