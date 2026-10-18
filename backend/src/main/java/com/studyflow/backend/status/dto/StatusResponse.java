package com.studyflow.backend.status.dto;

import com.studyflow.backend.status.entity.Status;

public record StatusResponse(
    Long id,
    String name,
    double sortOrder,
    boolean done
) {
    public static StatusResponse from(Status status) {
        return new StatusResponse(status.getId(), status.getName(), status.getSortOrder(), status.isDone());
    }
}
