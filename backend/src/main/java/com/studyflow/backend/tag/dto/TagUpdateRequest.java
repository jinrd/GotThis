package com.studyflow.backend.tag.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record TagUpdateRequest(
    @Size(max = 30, message = "태그 이름은 30자 이하여야 합니다.")
    @Pattern(regexp = ".*\\S.*", message = "태그 이름은 공백만으로 이루어질 수 없습니다.")
    String name,

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "색상은 #RRGGBB 형식이어야 합니다.")
    String color,

    Boolean clearColor
) {
    // AssertTrue 이거는 언제 쓰는거임
    @JsonIgnore 
    @AssertTrue (message = "color와 clearColor 는 함께 보낼 수 없습니다.")
    public boolean isColorRequestValid() {
        return !(color != null && Boolean.TRUE.equals(clearColor));
    }
}