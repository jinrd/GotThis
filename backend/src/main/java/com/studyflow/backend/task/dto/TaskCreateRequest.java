package com.studyflow.backend.task.dto;

import java.time.LocalDate;

import com.studyflow.backend.task.entity.Priority;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TaskCreateRequest(
        @NotBlank(message = "제목은 필수입니다.")
    @Size(max = 200, message = "제목은 200자 이하여야 합니다.")
    String title,

    @Size(max = 2000, message = "설명은 2000자 이하여야 합니다.")
    String description,

    Priority priority,

    LocalDate dueDate,

    Long statusId,

    Long parentId
) {

}
