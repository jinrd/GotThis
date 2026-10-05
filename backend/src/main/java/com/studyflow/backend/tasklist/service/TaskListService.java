package com.studyflow.backend.tasklist.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.studyflow.backend.global.exception.BusinessException;
import com.studyflow.backend.global.exception.ErrorCode;
import com.studyflow.backend.status.entity.Status;
import com.studyflow.backend.status.repository.StatusRepository;
import com.studyflow.backend.tasklist.dto.TaskListCreateRequest;
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
        User user = userRepository.getReferenceById(userId); // findById 와 refereceById 의 차이점?
        int nextSortOrder = taskListRepository.findMaxSortOrder(userId) + 1;
        TaskList taskList = TaskList.create(user, request.name(), request.color(), nextSortOrder);

        TaskList saved = taskListRepository.save(taskList);
        statusRepository.saveAll(Status.defaults(saved));
        return TaskListResponse.from(saved);
    }

    public List<TaskListResponse> findAll(Long userId) {
        return taskListRepository.findAllByUserIdOrderBySortOrderAsc(userId).stream().map(TaskListResponse::from).toList();
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
    public void delete(Long userId, Long id) {
        taskListRepository.delete(getTaskList(userId, id));
    }

    private TaskList getTaskList(Long userId, Long id) {
        return taskListRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TASK_LIST_NOT_FOUND));
    }
}
