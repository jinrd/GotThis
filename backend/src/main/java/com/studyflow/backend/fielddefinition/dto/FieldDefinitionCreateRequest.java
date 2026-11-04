package com.studyflow.backend.fielddefinition.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.studyflow.backend.fielddefinition.entity.FieldType;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record FieldDefinitionCreateRequest(
    @NotBlank (message = "필드 이름은 필수입니다.")
    @Size (max = 50, message = "필드 이름은 50자 이하여야 합니다.")
    String name,

    @NotNull (message = "필드 타입은 필수입니다.")
    FieldType type,
    @Size (min = 1, max = 50, message = "선택지는 1~50개여야 합니다.")
    List< @NotBlank (message = "선택지는 비어 있을 수 없습니다.") @Size (max = 50, message = "선택지는 50자 이하여야 합니다.") String> options
) {

    @JsonIgnore 
    @AssertTrue(message = "SELECT 타입은 선택지가 필요하고, 다른 타입은 선택지를 가질 수 없습니다.")
    public boolean isOptionsMatchType() {
        if(type == null) {
            return true;
        }

        return (type == FieldType.SELECT) == (options != null);
    }

    @JsonIgnore
    @AssertTrue(message = "선택지에 중복이 있습니다.")
    public boolean isOptionsUnique() {
        return options == null || options.stream().distinct().count() == options.size();
    }
}
