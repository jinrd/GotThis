package com.studyflow.backend.task.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.studyflow.backend.global.exception.BusinessException;
import com.studyflow.backend.global.exception.ErrorCode;
import com.studyflow.backend.status.entity.Status;
import com.studyflow.backend.status.repository.StatusRepository;
import com.studyflow.backend.task.dto.TaskCreateRequest;
import com.studyflow.backend.task.dto.TaskResponse;
import com.studyflow.backend.task.dto.TaskUpdateRequest;
import com.studyflow.backend.task.entity.Task;
import com.studyflow.backend.task.repository.TaskRepository;
import com.studyflow.backend.tasklist.entity.TaskList;
import com.studyflow.backend.tasklist.repository.TaskListRepository;

@Service 
@Transactional (readOnly = true)
public class TaskService {
    private final TaskRepository taskRepository;
    private final TaskListRepository taskListRepository;
    private final StatusRepository statusRepository;

    public TaskService(TaskRepository taskRepository, TaskListRepository taskListRepository, StatusRepository statusRepository) {
        this.taskRepository = taskRepository;
        this.taskListRepository = taskListRepository;
        this.statusRepository = statusRepository;
    }

    @Transactional
    public TaskResponse create(Long userId, Long taskListId, TaskCreateRequest request) {
        TaskList taskList = getTaskList(userId, taskListId);
        Status status = resolveStatus(taskListId, request.statusId());
        Task parent = resolveParent(taskListId, request.parentId());

        int nextSortOrder = (parent == null)
                ? taskRepository.findMaxSortOrder(status.getId()) + 1
                : taskRepository.findMaxSortOrderByParentId(parent.getId()) + 1;

        Task task = Task.create(taskList, status, parent, request.title(), request.description(),
                request.priority(), request.dueDate(), nextSortOrder);
        return TaskResponse.from(taskRepository.save(task));
    }

    public List<TaskResponse> findAll(Long userId, Long taskListId) {
        getTaskList(userId, taskListId);
        return taskRepository.findAllByTaskListIdOrderByStatusIdAscSortOrderAsc(taskListId).stream().map(TaskResponse::from).toList();
    }

    public TaskResponse findById(Long userId, Long taskListId, Long taskId) {
        return TaskResponse.from(getTask(userId, taskListId, taskId));
    }

    @Transactional
    public TaskResponse update(Long userId, Long taskListId, Long taskId, TaskUpdateRequest request) {
        Task task = getTask(userId, taskListId, taskId);
        task.update(request.title(), request.description(), request.priority(), request.dueDate());

        if (Boolean.TRUE.equals(request.clearDueDate())) {
            task.clearDueDate();
        }

        if (request.statusId() != null && !request.statusId().equals(task.getStatus().getId())) {
            Status status = getStatus(taskListId, request.statusId());
            int sortOrder = (task.getParent() == null)
                    ? taskRepository.findMaxSortOrder(status.getId()) + 1
                    : task.getSortOrder();     // 하위 작업은 부모 안의 순서를 유지
            task.changeStatus(status, sortOrder);
        }

        taskRepository.flush(); // 응답의 updatedAt 반영
        return TaskResponse.from(task);
    }

    public List<TaskResponse> findSubtasks(Long userId, Long taskListId, Long taskId) {
        getTask(userId, taskListId, taskId);   // 소유권 확인 (부모가 내 것인가)
        return taskRepository.findAllByParentIdOrderBySortOrderAsc(taskId)
                .stream().map(TaskResponse::from).toList();
    }


    @Transactional
    public void delete(Long userId, Long taskListId, Long taskId) {
        taskRepository.delete(getTask(userId, taskListId, taskId));
    }

    private TaskList getTaskList(Long userId, Long taskListId) {
        return taskListRepository.findByIdAndUserId(taskListId, userId).orElseThrow(() -> new BusinessException(ErrorCode.TASK_LIST_NOT_FOUND));
    }

    private Task getTask(Long userId, Long taskListId, Long taskId) {
        getTaskList(userId, taskListId);
        return taskRepository.findByIdAndTaskListId(taskId, taskListId).orElseThrow(() -> new BusinessException(ErrorCode.TASK_NOT_FOUND));
    }

    private Status getStatus(Long taskListId, Long statusId) {
        return statusRepository.findByIdAndTaskListId(statusId, taskListId).orElseThrow(() -> new BusinessException(ErrorCode.STATUS_NOT_FOUND));
    }

    private Status resolveStatus(Long taskListId, Long statusId) {
        if (statusId == null) {
            return statusRepository.findFirstByTaskListIdOrderBySortOrderAsc(taskListId)
                                    .orElseThrow(() -> new BusinessException(ErrorCode.STATUS_NOT_FOUND));
        }

        return getStatus(taskListId, statusId);
    }

    private Task resolveParent(Long taskListId, Long parentId) {
        if (parentId == null) {
            return null;
        }
        Task parent = taskRepository.findByIdAndTaskListId(parentId, taskListId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TASK_NOT_FOUND));
        if (parent.getParent() != null) {
            throw new BusinessException(ErrorCode.INVALID_PARENT_TASK);
        }
        return parent;
    }
}
