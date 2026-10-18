package com.studyflow.backend.status.dto;

public record StatusMoveRequest(
    Long prevStatusId,   // 놓은 자리 바로 왼쪽 상태. 맨 왼쪽이면 null
    Long nextStatusId    // 놓은 자리 바로 오른쪽 상태. 맨 오른쪽이면 null
) {}