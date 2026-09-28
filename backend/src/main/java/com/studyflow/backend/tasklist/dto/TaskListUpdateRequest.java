package com.studyflow.backend.tasklist.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record TaskListUpdateRequest(
        @Size(max = 50, message = "목록 이름은 50자 이하여야 합니다.")
        @Pattern(regexp = ".*\\S.*", message = "목록 이름은 공백만으로 이루어질 수 없습니다.")
        String name,

        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "색상은 #RRGGBB 형식이어야 합니다.")
        String color
) {
}
