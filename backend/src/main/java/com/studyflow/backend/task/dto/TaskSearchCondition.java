package com.studyflow.backend.task.dto;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

import com.studyflow.backend.task.entity.Priority;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Size;

public record TaskSearchCondition(
    Long statusId,
    Priority priority,
    Long tagId,

    @Size(max = 100, message = "검색어는 100자 이하여야 합니다.")
    String keyword,

    @DateTimeFormat (iso = DateTimeFormat.ISO.DATE)
    LocalDate dueFrom,

    @DateTimeFormat (iso = DateTimeFormat.ISO.DATE)
    LocalDate dueTo
) {
    @AssertTrue(message = "dueFrom은 dueTo보다 늦을 수 없습니다.")
    public boolean isDueRangeValid() {
        return dueFrom == null || dueTo == null || !dueFrom.isAfter(dueTo);
    }
}