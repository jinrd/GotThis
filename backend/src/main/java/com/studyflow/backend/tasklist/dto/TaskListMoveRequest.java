package com.studyflow.backend.tasklist.dto;

public record TaskListMoveRequest(
    Long prevTaskListId, // 놓은 자리 바로 위 목록. 맨 위면 null
    Long nextTaskListId  // 놓은 자리 바로 아래 목록. 맨 아래면 null
) {}