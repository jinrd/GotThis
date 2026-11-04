package com.studyflow.backend.fielddefinition.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record FieldDefinitionUpdateRequest(
    @Size(max = 50, message = "필드 이름은 50자 이하여야 합니다.")
    @Pattern(regexp = ".*\\S.*", message = "필드 이름은 공백만으로 이루어질 수 없습니다.")
    String name,

    @Size(min = 1, max = 50, message = "선택지는 1~50개여야 합니다.")
    List<@NotBlank(message = "선택지는 비어 있을 수 없습니다.")
         @Size(max = 50, message = "선택지는 50자 이하여야 합니다.") String> options
) {

    @JsonIgnore
    @AssertTrue(message = "선택지에 중복이 있습니다.")
    public boolean isOptionsUnique() {
        return options == null || options.stream().distinct().count() == options.size();
    }
}
