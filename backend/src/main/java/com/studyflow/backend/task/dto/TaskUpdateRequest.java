package com.studyflow.backend.task.dto;

import java.time.LocalDate;

import com.studyflow.backend.task.entity.Priority;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record TaskUpdateRequest(
    @Size(max = 200, message = "제목은 200자 이하여야 합니다.")
    @Pattern(regexp = ".*\\S.*", message = "제목은 공백만으로 이루어질 수 없습니다.")
    String title,

    @Size(max = 2000, message = "설명은 2000자 이하여야 합니다.")
    String description,

    Priority priority,

    LocalDate dueDate,

    Boolean clearDueDate,

    Long statusId
) {}
