package com.studyflow.backend.status.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record StatusUpdateRequest(
    @Size(max = 30, message = "상태 이름은 30자 이하여야 합니다.")
    @Pattern(regexp = ".*\\S.*", message = "상태 이름은 공백만으로 이루어질 수 없습니다.")
    String name,

    Boolean done
) {}
