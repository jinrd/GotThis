package com.studyflow.backend.tasklist.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.studyflow.backend.global.exception.BusinessException;
import com.studyflow.backend.global.exception.ErrorCode;
import com.studyflow.backend.tasklist.dto.TaskListCreateRequest;
import com.studyflow.backend.tasklist.dto.TaskListResponse;
import com.studyflow.backend.tasklist.dto.TaskListUpdateRequest;
import com.studyflow.backend.tasklist.entity.TaskList;
import com.studyflow.backend.tasklist.repository.TaskListRepository;


@Service 
@Transactional(readOnly = true)
public class TaskListService {
    
    private final TaskListRepository taskListRepository;

    public TaskListService(TaskListRepository taskListRepository) {
        this.taskListRepository = taskListRepository;
    }

    @Transactional 
    public TaskListResponse create(TaskListCreateRequest request) {
        int nextSortOrder = taskListRepository.findMaxSortOrder() + 1;
        TaskList taskList = TaskList.create(request.name(), request.color(), nextSortOrder);
        return TaskListResponse.from(taskListRepository.save(taskList));
    }

    public List<TaskListResponse> findAll() {
        return taskListRepository.findAllByOrderBySortOrderAsc().stream().map(TaskListResponse::from).toList();
    }

    public TaskListResponse findById(Long id) {
        return TaskListResponse.from(getTaskList(id));
    }

    @Transactional
    public TaskListResponse update(Long id, TaskListUpdateRequest request) {
        TaskList taskList = getTaskList(id);
        taskList.update(request.name(), request.color());
        taskListRepository.flush(); // @LastModifiedDate 반영 후 응답 생성
        return TaskListResponse.from(taskList);
    }

    @Transactional
    public void delete(Long id) {
        taskListRepository.delete(getTaskList(id));
    }

    private TaskList getTaskList(Long id) {
        return taskListRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.TASK_LIST_NOT_FOUND));
    }
}
