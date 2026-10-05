package com.studyflow.backend.task.controller;

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
import com.studyflow.backend.task.dto.TaskCreateRequest;
import com.studyflow.backend.task.dto.TaskResponse;
import com.studyflow.backend.task.dto.TaskUpdateRequest;
import com.studyflow.backend.task.service.TaskService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "Task", description = "할 일 API")
@RestController
@RequestMapping("/api/task-lists/{taskListId}/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @Operation(summary = "할 일 생성", description = "statusId를 생략하면 목록의 첫 번째 상태에 추가합니다.")
    @PostMapping
    public ResponseEntity<ApiResponse<TaskResponse>> create(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long taskListId,
            @Valid @RequestBody TaskCreateRequest request) {
        TaskResponse response = taskService.create(userId, taskListId, request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{taskId}")
                .buildAndExpand(response.id())
                .toUri();
        return ResponseEntity.created(location).body(ApiResponse.ok(response));
    }

    @Operation(summary = "할 일 전체 조회", description = "같은 상태끼리 모아 순서대로 조회합니다.")
    @GetMapping
    public ApiResponse<List<TaskResponse>> findAll(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long taskListId) {
        return ApiResponse.ok(taskService.findAll(userId, taskListId));
    }

    @Operation(summary = "할 일 상세 조회")
    @GetMapping("/{taskId}")
    public ApiResponse<TaskResponse> findById(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long taskListId,
            @PathVariable Long taskId) {
        return ApiResponse.ok(taskService.findById(userId, taskListId, taskId));
    }

    @Operation(summary = "할 일 수정",
            description = "보낸 필드만 수정합니다. clearDueDate=true면 마감일을 지웁니다. statusId를 바꾸면 그 상태의 맨 뒤로 옮깁니다.")
    @PatchMapping("/{taskId}")
    public ApiResponse<TaskResponse> update(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long taskListId,
            @PathVariable Long taskId,
            @Valid @RequestBody TaskUpdateRequest request) {
        return ApiResponse.ok(taskService.update(userId, taskListId, taskId, request));
    }

    @Operation(summary = "할 일 삭제")
    @DeleteMapping("/{taskId}")
    public ApiResponse<Void> delete(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long taskListId,
            @PathVariable Long taskId) {
        taskService.delete(userId, taskListId, taskId);
        return ApiResponse.ok();
    }

    @Operation(summary = "하위 작업 조회")
    @GetMapping("/{taskId}/subtasks")
    public ApiResponse<List<TaskResponse>> findSubtasks(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long taskListId,
            @PathVariable Long taskId) {
        return ApiResponse.ok(taskService.findSubtasks(userId, taskListId, taskId));
    }
}
