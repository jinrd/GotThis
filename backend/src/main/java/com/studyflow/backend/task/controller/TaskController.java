package com.studyflow.backend.task.controller;

import java.net.URI;
import java.util.List;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.studyflow.backend.global.response.ApiResponse;
import com.studyflow.backend.task.dto.TaskCreateRequest;
import com.studyflow.backend.task.dto.TaskMoveRequest;
import com.studyflow.backend.task.dto.TaskResponse;
import com.studyflow.backend.task.dto.TaskSearchCondition;
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

    @Operation(summary = "할 일 전체 조회",
        description = "같은 상태끼리 모아 순서대로 조회합니다. 모든 조건은 선택이며 함께 주면 AND로 결합합니다. "
                + "keyword는 제목과 설명에서 대소문자 구분 없이 찾습니다. dueFrom/dueTo를 주면 마감일이 없는 할 일은 제외됩니다.")
    @GetMapping
    public ApiResponse<List<TaskResponse>> findAll(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long taskListId,
            @ParameterObject @Valid @ModelAttribute TaskSearchCondition condition) {
        return ApiResponse.ok(taskService.findAll(userId, taskListId, condition));
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

    @Operation(summary = "할 일에 태그 붙이기", description = "이미 붙어 있으면 아무것도 하지 않습니다.")
    @PutMapping("/{taskId}/tags/{tagId}")
    public ApiResponse<TaskResponse> addTag(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long taskListId,
            @PathVariable Long taskId,
            @PathVariable Long tagId) {
        return ApiResponse.ok(taskService.addTag(userId, taskListId, taskId, tagId));
    }

    @Operation(summary = "할 일에서 태그 떼기", description = "붙어 있지 않으면 아무것도 하지 않습니다.")
    @DeleteMapping("/{taskId}/tags/{tagId}")
    public ApiResponse<TaskResponse> removeTag(
        @AuthenticationPrincipal Long userId,
                @PathVariable Long taskListId,
                @PathVariable Long taskId,
                @PathVariable Long tagId
        ) {
        return ApiResponse.ok(taskService.removeTag(userId, taskListId, taskId, tagId));
    }

    @Operation(summary = "할 일 이동 (드래그 앤 드롭)",
        description = "놓은 자리의 바로 위(prevTaskId)와 바로 아래(nextTaskId) 할 일을 보냅니다. "
                + "맨 위면 prevTaskId, 맨 아래면 nextTaskId를 생략합니다. statusId를 주면 그 상태 열로 옮기고, 생략하면 지금 열 안에서 옮깁니다. "
                + "앞뒤가 실제로 바로 이웃이 아니면 400을 반환하므로, 목록을 다시 조회한 뒤 재시도합니다. 하위 작업은 아직 이동할 수 없습니다.")
    @PatchMapping("/{taskId}/position")
    public ApiResponse<TaskResponse> move(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long taskListId,
            @PathVariable Long taskId,
            @RequestBody TaskMoveRequest request) {
        return ApiResponse.ok(taskService.move(userId, taskListId, taskId, request));
    }
}
