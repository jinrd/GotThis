package com.studyflow.backend.status.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record StatusCreateRequest(
    @NotBlank (message = "상태 이름은 필수입니다.")
    @Size (max=30, message = "상태 이름은 30자 이하여야 합니다.")
    String name,
    Boolean done
) {
    public StatusCreateRequest {
        if(done == null) {
            done = false;
        }
    }
}
