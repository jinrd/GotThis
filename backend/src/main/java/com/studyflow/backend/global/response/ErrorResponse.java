package com.studyflow.backend.global.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude (JsonInclude.Include.NON_EMPTY)
public record ErrorResponse(
    String code,
    String message,
    List<FieldError> fieldErrors
) {
    public static ErrorResponse of(String code, String message) {
        return new ErrorResponse(code, message, List.of());
    }

    public static ErrorResponse of(String code, String message, List<FieldError> fieldErrors) {
        return new ErrorResponse(code, message, fieldErrors);
    }

    public record FieldError(String field, String reason) {}
}