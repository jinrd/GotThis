package com.studyflow.backend.tasklist.dto;

import java.time.LocalDateTime;

import com.studyflow.backend.tasklist.entity.TaskList;

public record TaskListResponse(
    Long id,
    String name,
    String color,
    double sortOrder,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static TaskListResponse from(TaskList taskList) {
        return new TaskListResponse(
                taskList.getId(),
                taskList.getName(),
                taskList.getColor(),
                taskList.getSortOrder(),
                taskList.getCreatedAt(),
                taskList.getUpdatedAt()
            );
    }
}
