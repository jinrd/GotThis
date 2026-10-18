package com.studyflow.backend.status.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.studyflow.backend.global.exception.BusinessException;
import com.studyflow.backend.global.exception.ErrorCode;
import com.studyflow.backend.global.ordering.GapOrdering;
import com.studyflow.backend.status.dto.StatusCreateRequest;
import com.studyflow.backend.status.dto.StatusMoveRequest;
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
        TaskList taskList = lockTaskList(userId, taskListId);

        if(statusRepository.existsByTaskListIdAndName(taskListId, request.name())) {
            throw new BusinessException(ErrorCode.DUPLICATE_STATUS_NAME);
        }

        double sortOrder = GapOrdering.after(statusRepository.findLastSortOrder(taskListId));
        Status status = Status.create(taskList, request.name(), sortOrder, request.done());

        return StatusResponse.from(statusRepository.save(status));
    }

    public List<StatusResponse> findAll(Long userId, Long taskListId) {
        getTaskList(userId, taskListId); // 소유권 확인만
        return statusRepository.findAllByTaskListIdOrderBySortOrderAscIdAsc(taskListId).stream().map(StatusResponse::from).toList();
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
    public StatusResponse move(Long userId, Long taskListId, Long statusId, StatusMoveRequest request) {
        lockTaskList(userId, taskListId);
        Status status = findStatusInList(taskListId, statusId);
        Status prev = findNeighbor(taskListId, status, request.prevStatusId());
        Status next = findNeighbor(taskListId, status, request.nextStatusId());

        // 앞뒤가 진짜 바로 왼쪽, 바로 오른쪽 인지 : 순서가 맞고, 사이에 다른 상태가 없어야 한다.
        double low = (prev == null) ? 0.0 : prev.getSortOrder();
        double high = (next == null) ? Double.MAX_VALUE : next.getSortOrder();
        if (low >= high || statusRepository.existsInListBetween(taskListId, status.getId(), low, high)) {
            throw new BusinessException(ErrorCode.INVALID_MOVE_TARGET);
        }

        if (!GapOrdering.hasRoom(sortOrderOf(prev), sortOrderOf(next))) {
            rebalance(taskListId);   // prev, next의 값도 함께 바뀐다
        }

        status.changeSortOrder(GapOrdering.between(sortOrderOf(prev), sortOrderOf(next)));
        statusRepository.flush(); // 응답의 값 반영
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

    private TaskList lockTaskList(Long userId, Long taskListId) {
        return taskListRepository.findByIdAndUserIdForUpdate(taskListId, userId)
                            .orElseThrow(() -> new BusinessException(ErrorCode.TASK_LIST_NOT_FOUND));
    }

    private TaskList getTaskList(Long userId, Long taskListId) {
        return taskListRepository.findByIdAndUserId(taskListId, userId)
                                .orElseThrow(() -> new BusinessException(ErrorCode.TASK_LIST_NOT_FOUND));

    }

    private Status getStatus(Long userId, Long taskListId, Long statusId) {
        getTaskList(userId, taskListId);

        return statusRepository.findByIdAndTaskListId(statusId, taskListId).orElseThrow(() -> new BusinessException(ErrorCode.STATUS_NOT_FOUND));
    }

    private Status findStatusInList(Long taskListId, Long statusId) {
        return statusRepository.findByIdAndTaskListId(statusId, taskListId).orElseThrow(() -> new BusinessException(ErrorCode.STATUS_NOT_FOUND));
    }

    // 앞뒤 상태는 같은 공책의 상태여야 하고, 옮기는 상태 자신이면 안 된다
    private Status findNeighbor(Long taskListId, Status moving, Long neighborId) {
        if (neighborId == null) {
            return null;
        }
        Status neighbor = findStatusInList(taskListId, neighborId);
        if (neighbor.getId().equals(moving.getId())) {
            throw new BusinessException(ErrorCode.INVALID_MOVE_TARGET);
        }
        return neighbor;
    }

    private Double sortOrderOf(Status status) {
        return (status == null) ? null : status.getSortOrder();
    }

    // 공책의 상태 전체를 GAP, 2GAP, 3GAP ... 으로 다시 매긴다 (간격이 바닥났을 때만)
    private void rebalance(Long taskListId) {
        List<Status> statuses = statusRepository.findAllByTaskListIdOrderBySortOrderAscIdAsc(taskListId);
        for (int i = 0; i < statuses.size(); i++) {
            statuses.get(i).changeSortOrder(GapOrdering.nth(i));
        }
    }
}
