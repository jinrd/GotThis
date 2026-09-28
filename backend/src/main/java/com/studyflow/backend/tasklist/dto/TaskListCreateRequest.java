package com.studyflow.backend.tasklist.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record TaskListCreateRequest(
    @NotBlank(message = "목록 이름은 필수입니다.")
    @Size(max = 50, message = "목록 이름은 50자 이하여야 합니다.")
    String name,

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "색상은 #RRGGBB 형식이어야 합니다.")
    String color
) {
}