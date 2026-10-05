package com.studyflow.backend.task.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.studyflow.backend.task.entity.Priority;
import com.studyflow.backend.task.entity.Task;

public record TaskResponse(
    Long id,
    Long statusId,
    Long parentId,
    String title,
    String description,
    Priority priority,
    LocalDate dueDate,
    int sortOrder,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static TaskResponse from(Task task) {
         return new TaskResponse(
            task.getId(),
            task.getStatus().getId(),
            task.getParent() == null ? null : task.getParent().getId(),
            task.getTitle(),
            task.getDescription(),
            task.getPriority(),
            task.getDueDate(),
            task.getSortOrder(),
            task.getCreatedAt(),
            task.getUpdatedAt()
        );
    }
}
