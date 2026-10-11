package com.studyflow.backend.task.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.studyflow.backend.tag.dto.TagSummary;
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
    List<TagSummary> tags,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static TaskResponse from(Task task, List<TagSummary> tags) {
         return new TaskResponse(
            task.getId(),
            task.getStatus().getId(),
            task.getParent() == null ? null : task.getParent().getId(),
            task.getTitle(),
            task.getDescription(),
            task.getPriority(),
            task.getDueDate(),
            task.getSortOrder(),
            tags,
            task.getCreatedAt(),
            task.getUpdatedAt()
        );
    }
}
