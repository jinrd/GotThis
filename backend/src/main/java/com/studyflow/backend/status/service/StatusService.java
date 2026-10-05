package com.studyflow.backend.status.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.studyflow.backend.global.exception.BusinessException;
import com.studyflow.backend.global.exception.ErrorCode;
import com.studyflow.backend.status.dto.StatusCreateRequest;
import com.studyflow.backend.status.dto.StatusResponse;
import com.studyflow.backend.status.dto.StatusUpdateRequest;
import com.studyflow.backend.status.entity.Status;
import com.studyflow.backend.status.repository.StatusRepository;
import com.studyflow.backend.task.repository.TaskRepository;
import com.studyflow.backend.tasklist.entity.TaskList;
import com.studyflow.backend.tasklist.repository.TaskListRepository;


@Service 
@Transactional (readOnly = true)
public class StatusService {
    private final StatusRepository statusRepository;
    private final TaskListRepository taskListRepository;
    private final TaskRepository taskRepository;

    public StatusService(StatusRepository statusRepository, TaskListRepository taskListRepository, TaskRepository taskRepository) {
        this.statusRepository = statusRepository;
        this.taskListRepository = taskListRepository;
        this.taskRepository = taskRepository;
    }

    @Transactional 
    public StatusResponse create(Long userId, Long taskListId, StatusCreateRequest request) {
        TaskList taskList = getTaskList(userId, taskListId);

        if(statusRepository.existsByTaskListIdAndName(taskListId, request.name())) {
            throw new BusinessException(ErrorCode.DUPLICATE_STATUS_NAME);
        }

        int nextSortOrder = statusRepository.findMaxSortOrder(taskListId) + 1;
        Status status = Status.create(taskList, request.name(), nextSortOrder, request.done());

        return StatusResponse.from(statusRepository.save(status));
    }

    public List<StatusResponse> findAll(Long userId, Long taskListId) {
        getTaskList(userId, taskListId); // 소유권 확인만
        return statusRepository.findAllByTaskListIdOrderBySortOrderAsc(taskListId).stream().map(StatusResponse::from).toList();
    }

    @Transactional
    public StatusResponse update(Long userId, Long taskListId, Long statusId, StatusUpdateRequest request) {
        Status status = getStatus(userId, taskListId, statusId);
        if (request.name() != null
                && statusRepository.existsByTaskListIdAndNameAndIdNot(taskListId, request.name(), statusId)) {
            throw new BusinessException(ErrorCode.DUPLICATE_STATUS_NAME);
        }
        status.update(request.name(), request.done());
        return StatusResponse.from(status);
    }

    @Transactional
    public void delete(Long userId, Long taskListId, Long statusId) {
        Status status = getStatus(userId, taskListId, statusId);
        if (statusRepository.countByTaskListId(taskListId) <= 1) {
            throw new BusinessException(ErrorCode.LAST_STATUS_CANNOT_BE_DELETED);
        }
        if (taskRepository.existsByStatusId(statusId)) {
            throw new BusinessException(ErrorCode.STATUS_IN_USE);
        }
        statusRepository.delete(status);
    }

    private TaskList getTaskList(Long userId, Long taskListId) {
        return taskListRepository.findByIdAndUserId(taskListId, userId)
                                .orElseThrow(() -> new BusinessException(ErrorCode.TASK_LIST_NOT_FOUND));

    }

    private Status getStatus(Long userId, Long taskListId, Long statusId) {
        getTaskList(userId, taskListId);

        return statusRepository.findByIdAndTaskListId(statusId, taskListId).orElseThrow(() -> new BusinessException(ErrorCode.STATUS_NOT_FOUND));
    }
}
