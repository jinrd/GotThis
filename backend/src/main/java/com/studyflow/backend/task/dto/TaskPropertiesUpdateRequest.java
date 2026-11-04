package com.studyflow.backend.task.dto;

import java.util.Map;

import jakarta.validation.constraints.NotNull;

// values의 키는 필드 정의 id(문자열), 값이 null이면 그 속성을 지운다
public record TaskPropertiesUpdateRequest(
    @NotNull(message = "values는 필수입니다.")
    Map<String, Object> values
) {}
