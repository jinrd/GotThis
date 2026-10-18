package com.studyflow.backend.tasklist.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.studyflow.backend.global.exception.BusinessException;
import com.studyflow.backend.global.exception.ErrorCode;
import com.studyflow.backend.global.ordering.GapOrdering;
import com.studyflow.backend.status.entity.Status;
import com.studyflow.backend.status.repository.StatusRepository;
import com.studyflow.backend.tasklist.dto.TaskListCreateRequest;
import com.studyflow.backend.tasklist.dto.TaskListMoveRequest;
import com.studyflow.backend.tasklist.dto.TaskListResponse;
import com.studyflow.backend.tasklist.dto.TaskListUpdateRequest;
import com.studyflow.backend.tasklist.entity.TaskList;
import com.studyflow.backend.tasklist.repository.TaskListRepository;
import com.studyflow.backend.user.entity.User;
import com.studyflow.backend.user.repository.UserRepository;


@Service 
@Transactional(readOnly = true)
public class TaskListService {
    
    private final TaskListRepository taskListRepository;
    private final StatusRepository statusRepository;
    private final UserRepository userRepository;

    public TaskListService(TaskListRepository taskListRepository, StatusRepository statusRepository,UserRepository userRepository) {
        this.taskListRepository = taskListRepository;
        this.statusRepository = statusRepository;
        this.userRepository = userRepository;
    }

    @Transactional 
    public TaskListResponse create(Long userId, TaskListCreateRequest request) {
        User user = lockUser(userId);
        double sortOrder = GapOrdering.after(taskListRepository.findLastSortOrder(userId));
        TaskList taskList = TaskList.create(user, request.name(), request.color(), sortOrder);

        TaskList saved = taskListRepository.save(taskList);
        statusRepository.saveAll(Status.defaults(saved));
        return TaskListResponse.from(saved);
    }

    public List<TaskListResponse> findAll(Long userId) {
        return taskListRepository.findAllByUserIdOrderBySortOrderAscIdAsc(userId).stream().map(TaskListResponse::from).toList();
    }

    public TaskListResponse findById(Long userId, Long id) {
        return TaskListResponse.from(getTaskList(userId, id));
    }

    @Transactional
    public TaskListResponse update(Long userId, Long id, TaskListUpdateRequest request) {
        TaskList taskList = getTaskList(userId, id);
        taskList.update(request.name(), request.color());
        taskListRepository.flush(); // @LastModifiedDate 반영 후 응답 생성
        return TaskListResponse.from(taskList);
    }

    @Transactional
    public TaskListResponse move(Long userId, Long id, TaskListMoveRequest request) {
        lockUser(userId);
        TaskList taskList = getTaskList(userId, id);
        TaskList prev = findNeighbor(userId, taskList, request.prevTaskListId());
        TaskList next = findNeighbor(userId, taskList, request.nextTaskListId());

        // 앞뒤가 진짜 "바로 위, 바로 아래"인지: 순서가 맞고, 사이에 다른 목록이 없어야 한다
        double low = (prev == null) ? 0.0 : prev.getSortOrder();
        double high = (next == null) ? Double.MAX_VALUE : next.getSortOrder();
        if (low >= high || taskListRepository.existsInUserBetween(userId, taskList.getId(), low, high)) {
            throw new BusinessException(ErrorCode.INVALID_MOVE_TARGET);
        }

        if (!GapOrdering.hasRoom(sortOrderOf(prev), sortOrderOf(next))) {
            rebalance(userId);   // prev, next의 값도 함께 바뀐다
        }

        taskList.changeSortOrder(GapOrdering.between(sortOrderOf(prev), sortOrderOf(next)));
        taskListRepository.flush(); // 응답의 updatedAt 반영
        return TaskListResponse.from(taskList);
    }


    @Transactional
    public void delete(Long userId, Long id) {
        taskListRepository.delete(getTaskList(userId, id));
    }

    // 앞뒤 목록은 내 목록이어야 하고, 옮기는 목록 자신이면 안 된다
    private TaskList findNeighbor(Long userId, TaskList moving, Long neighborId) {
        if (neighborId == null) {
            return null;
        }
        TaskList neighbor = getTaskList(userId, neighborId);
        if (neighbor.getId().equals(moving.getId())) {
            throw new BusinessException(ErrorCode.INVALID_MOVE_TARGET);
        }
        return neighbor;
    }

    private Double sortOrderOf(TaskList taskList) {
        return (taskList == null) ? null : taskList.getSortOrder();
    }

    // 사용자의 목록 전체를 GAP, 2GAP, 3GAP ... 으로 다시 매긴다 (간격이 바닥났을 때만)
    private void rebalance(Long userId) {
        List<TaskList> taskLists = taskListRepository.findAllByUserIdOrderBySortOrderAscIdAsc(userId);
        for (int i = 0; i < taskLists.size(); i++) {
            taskLists.get(i).changeSortOrder(GapOrdering.nth(i));
        }
    }


    private User lockUser(Long userId) {
        return userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
    }

    private TaskList getTaskList(Long userId, Long id) {
        return taskListRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TASK_LIST_NOT_FOUND));
    }
}
