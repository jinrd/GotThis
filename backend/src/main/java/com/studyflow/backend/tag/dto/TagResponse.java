package com.studyflow.backend.tag.dto;

import java.time.LocalDateTime;

import com.studyflow.backend.tag.entity.Tag;

public record TagResponse(
    Long id,
    String name,
    String color,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static TagResponse from(Tag tag) { 
        return new TagResponse(tag.getId(), tag.getName(), tag.getColor(), tag.getCreatedAt(), tag.getUpdatedAt());
    }
}
