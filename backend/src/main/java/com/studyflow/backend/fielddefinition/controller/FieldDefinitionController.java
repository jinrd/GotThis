package com.studyflow.backend.fielddefinition.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.studyflow.backend.fielddefinition.dto.FieldDefinitionCreateRequest;
import com.studyflow.backend.fielddefinition.dto.FieldDefinitionResponse;
import com.studyflow.backend.fielddefinition.dto.FieldDefinitionUpdateRequest;
import com.studyflow.backend.fielddefinition.service.FieldDefinitionService;
import com.studyflow.backend.global.response.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "FieldDefinition", description = "목록별 사용자 정의 필드 API")
@RestController
@RequestMapping("/api/task-lists/{taskListId}/fields")
public class FieldDefinitionController {

    private final FieldDefinitionService fieldDefinitionService;

    public FieldDefinitionController(FieldDefinitionService fieldDefinitionService) {
        this.fieldDefinitionService = fieldDefinitionService;
    }

    @Operation(summary = "필드 추가",
            description = "목록의 맨 뒤 순서로 추가합니다. SELECT 타입은 options가 필수이고, 다른 타입은 options를 보낼 수 없습니다. "
                    + "타입은 생성 후 바꿀 수 없습니다.")
    @PostMapping
    public ResponseEntity<ApiResponse<FieldDefinitionResponse>> create(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long taskListId,
            @Valid @RequestBody FieldDefinitionCreateRequest request) {
        FieldDefinitionResponse response = fieldDefinitionService.create(userId, taskListId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response));
    }

    @Operation(summary = "필드 전체 조회", description = "목록의 필드를 순서대로 조회합니다.")
    @GetMapping
    public ApiResponse<List<FieldDefinitionResponse>> findAll(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long taskListId) {
        return ApiResponse.ok(fieldDefinitionService.findAll(userId, taskListId));
    }

    @Operation(summary = "필드 수정",
            description = "보낸 값만 수정합니다. options는 SELECT 타입 필드에만 보낼 수 있습니다. "
                    + "선택지를 줄이면 지워진 선택지를 값으로 가진 Task에서 그 값이 함께 삭제됩니다.")
    @PatchMapping("/{fieldId}")
    public ApiResponse<FieldDefinitionResponse> update(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long taskListId,
            @PathVariable Long fieldId,
            @Valid @RequestBody FieldDefinitionUpdateRequest request) {
        return ApiResponse.ok(fieldDefinitionService.update(userId, taskListId, fieldId, request));
    }

    @Operation(summary = "필드 삭제", description = "목록의 모든 Task에서 이 필드의 값이 함께 삭제됩니다.")
    @DeleteMapping("/{fieldId}")
    public ApiResponse<Void> delete(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long taskListId,
            @PathVariable Long fieldId) {
        fieldDefinitionService.delete(userId, taskListId, fieldId);
        return ApiResponse.ok();
    }
}
