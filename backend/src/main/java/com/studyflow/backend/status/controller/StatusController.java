package com.studyflow.backend.status.controller;

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

import com.studyflow.backend.global.response.ApiResponse;
import com.studyflow.backend.status.dto.StatusCreateRequest;
import com.studyflow.backend.status.dto.StatusMoveRequest;
import com.studyflow.backend.status.dto.StatusResponse;
import com.studyflow.backend.status.dto.StatusUpdateRequest;
import com.studyflow.backend.status.service.StatusService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "Status", description = "목록별 상태 API")
@RestController
@RequestMapping ("/api/task-lists/{taskListId}/statuses")
public class StatusController {

    private final StatusService statusService;

    public StatusController(StatusService statusService) {
        this.statusService = statusService;
    }

    @Operation(summary = "상태 추가", description = "목록의 맨 뒤 순서로 추가합니다.")
    @PostMapping
    public ResponseEntity<ApiResponse<StatusResponse>> create(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long taskListId,
            @Valid @RequestBody StatusCreateRequest request) {
        StatusResponse response = statusService.create(userId, taskListId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response));
    }


    @Operation(summary = "상태 전체 조회", description = "목록의 상태를 순서대로 조회합니다.")
    @GetMapping
    public ApiResponse<List<StatusResponse>> findAll(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long taskListId) {
        return ApiResponse.ok(statusService.findAll(userId, taskListId));
    }

    @Operation(summary = "상태 수정", description = "보낸 필드만 수정합니다.")
    @PatchMapping("/{statusId}")
    public ApiResponse<StatusResponse> update(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long taskListId,
            @PathVariable Long statusId,
            @Valid @RequestBody StatusUpdateRequest request) {
        return ApiResponse.ok(statusService.update(userId, taskListId, statusId, request));
    }
    
    @Operation(summary = "상태 이동 (드래그 앤 드롭)",
        description = "놓은 자리의 바로 왼쪽(prevStatusId)과 바로 오른쪽(nextStatusId) 상태를 보냅니다. "
                + "맨 왼쪽이면 prevStatusId, 맨 오른쪽이면 nextStatusId를 생략합니다. "
                + "앞뒤가 실제로 바로 이웃이 아니면 400을 반환하므로, 목록을 다시 조회한 뒤 재시도합니다.")
    @PatchMapping("/{statusId}/position")
    public ApiResponse<StatusResponse> move(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long taskListId,
            @PathVariable Long statusId,
            @RequestBody StatusMoveRequest request) {
        return ApiResponse.ok(statusService.move(userId, taskListId, statusId, request));
    }

    @Operation(summary = "상태 삭제", description = "목록의 마지막 상태는 삭제할 수 없습니다.")
    @DeleteMapping("/{statusId}")
    public ApiResponse<Void> delete(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long taskListId,
            @PathVariable Long statusId) {
        statusService.delete(userId, taskListId, statusId);
        return ApiResponse.ok();
    }

}
