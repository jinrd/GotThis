package com.studyflow.backend.global.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    // Common
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "입력값이 올바르지 않습니다."),
    METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "지원하지 않는 HTTP 메서드입니다."),
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "요청한 리소스를 찾을 수 없습니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다."),
    DATA_CONFLICT(HttpStatus.CONFLICT, "다른 요청과 충돌했습니다. 다시 시도해 주세요."),
    // TaskList
    TASK_LIST_NOT_FOUND(HttpStatus.NOT_FOUND, "목록을 찾을 수 없습니다."),
    // User
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다."),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "이메일 또는 비밀번호가 올바르지 않습니다."),

    // Auth
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "인증이 필요합니다."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다."),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "만료된 토큰입니다."),
    FORBIDDEN(HttpStatus.FORBIDDEN, "접근 권한이 없습니다."),
    
    // Status
    STATUS_NOT_FOUND(HttpStatus.NOT_FOUND, "상태를 찾을 수 없습니다."),
    DUPLICATE_STATUS_NAME(HttpStatus.CONFLICT, "이미 같은 이름의 상태가 있습니다."),
    LAST_STATUS_CANNOT_BE_DELETED(HttpStatus.CONFLICT, "목록에는 상태가 최소 하나 있어야 합니다."),
    STATUS_IN_USE(HttpStatus.CONFLICT, "할 일이 있는 상태는 삭제할 수 없습니다."),

    // Task
    TASK_NOT_FOUND(HttpStatus.NOT_FOUND, "할 일을 찾을 수 없습니다."),
    INVALID_PARENT_TASK(HttpStatus.BAD_REQUEST, "하위 작업에는 하위 작업을 만들 수 없습니다."),
    
    // Tag
    TAG_NOT_FOUND(HttpStatus.NOT_FOUND, "태그를 찾을 수 없습니다."),
    DUPLICATE_TAG_NAME(HttpStatus.CONFLICT, "이미 같은 이름의 태그가 있습니다."),
    ;


    private final HttpStatus status;
    private final String message;

    ErrorCode(HttpStatus status, String message){
        this.status = status;
        this.message = message;
    }

        public HttpStatus status() {
        return status;
    }

    public String code() {
        return name();
    }

    public String message() {
        return message;
    }
}
