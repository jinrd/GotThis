package com.studyflow.backend.task.dto;

public record TaskMoveRequest(
    Long statusId,      // 옮길 상태 열. 생략하면 지금 열 안에서 이동
    Long prevTaskId,    // 놓은 자리 바로 위 카드 . 맨 위면 null
    Long nextTaskId     // 놓은 자리 바로 아래 카드 . 맨 아래면 null
) {

}
