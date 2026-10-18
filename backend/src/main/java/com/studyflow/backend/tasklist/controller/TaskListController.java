package com.studyflow.backend.tasklist.controller;

import java.net.URI;
import java.util.List;

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
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.studyflow.backend.global.response.ApiResponse;
import com.studyflow.backend.tasklist.dto.TaskListCreateRequest;
import com.studyflow.backend.tasklist.dto.TaskListMoveRequest;
import com.studyflow.backend.tasklist.dto.TaskListResponse;
import com.studyflow.backend.tasklist.dto.TaskListUpdateRequest;
import com.studyflow.backend.tasklist.service.TaskListService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag (name = "TaskList", description = "할 일 목록 API")
@RestController 
@RequestMapping("/api/task-lists")
public class TaskListController {

    private final TaskListService taskListService;

    public TaskListController(TaskListService taskListService) {
        this.taskListService = taskListService;
    }

    @Operation(summary = "목록 생성")
    @PostMapping
    public ResponseEntity<ApiResponse<TaskListResponse>> create(
        @AuthenticationPrincipal Long userId,
        @Valid @RequestBody TaskListCreateRequest request
    ){
        TaskListResponse response = taskListService.create(userId, request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        return ResponseEntity.created(location).body(ApiResponse.ok(response));
    }

    @Operation(summary = "목록 전체 조회")
    @GetMapping
    public ApiResponse<List<TaskListResponse>> findAll(@AuthenticationPrincipal Long userId) {
        return ApiResponse.ok(taskListService.findAll(userId));
    }

    @Operation(summary = "목록 단건 조회")
    @GetMapping("/{id}")
    public ApiResponse<TaskListResponse> findById(@AuthenticationPrincipal Long userId, @PathVariable Long id) {
        return ApiResponse.ok(taskListService.findById(userId, id));
    }

    @Operation(summary = "목록 수정", description = "보낸 필드만 수정합니다.")
    @PatchMapping("/{id}")
    public ApiResponse<TaskListResponse> update(
            @AuthenticationPrincipal Long userId, 
            @PathVariable Long id,
            @Valid @RequestBody TaskListUpdateRequest request) {
        return ApiResponse.ok(taskListService.update(userId, id, request));
    }

    @PatchMapping("/{id}/position")
    public ApiResponse<TaskListResponse> move(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id,
            @RequestBody TaskListMoveRequest request) {
        return ApiResponse.ok(taskListService.move(userId, id, request));
    }

    @Operation(summary = "목록 삭제")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@AuthenticationPrincipal Long userId, @PathVariable Long id) {
        taskListService.delete(userId, id);
        return ApiResponse.ok();
    }
}
