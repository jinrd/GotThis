package com.studyflow.backend.fielddefinition.dto;

import java.util.List;

import com.studyflow.backend.fielddefinition.entity.FieldDefinition;
import com.studyflow.backend.fielddefinition.entity.FieldType;

public record FieldDefinitionResponse(Long id, String name, FieldType type,
                                      List<String> options, double sortOrder) {
    public static FieldDefinitionResponse from(FieldDefinition field) {
        return new FieldDefinitionResponse(field.getId(), field.getName(), field.getType(),
                field.getOptions() == null ? List.of() : field.getOptions(),
                field.getSortOrder());
    }
}
