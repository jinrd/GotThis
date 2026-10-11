package com.studyflow.backend.tag.dto;

import com.studyflow.backend.tag.entity.Tag;

public record TagSummary(Long id, String name, String color) {
    public static TagSummary from(Tag tag) {
        return new TagSummary(tag.getId(), tag.getName(), tag.getColor());
    }
}
