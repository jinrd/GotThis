package com.studyflow.backend.task.service;

import com.studyflow.backend.auth.controller.AuthController;
import static com.studyflow.backend.task.repository.TaskSpecifications.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.studyflow.backend.global.exception.BusinessException;
import com.studyflow.backend.global.exception.ErrorCode;
import com.studyflow.backend.status.entity.Status;
import com.studyflow.backend.status.repository.StatusRepository;
import com.studyflow.backend.tag.dto.TagSummary;
import com.studyflow.backend.tag.entity.Tag;
import com.studyflow.backend.tag.repository.TagRepository;
import com.studyflow.backend.task.dto.TaskCreateRequest;
import com.studyflow.backend.task.dto.TaskMoveRequest;
import com.studyflow.backend.task.dto.TaskResponse;
import com.studyflow.backend.task.dto.TaskSearchCondition;
import com.studyflow.backend.task.dto.TaskUpdateRequest;
import com.studyflow.backend.task.entity.Task;
import com.studyflow.backend.task.entity.TaskTag;
import com.studyflow.backend.task.repository.TaskRepository;
import com.studyflow.backend.task.repository.TaskTagRepository;
import com.studyflow.backend.tasklist.entity.TaskList;
import com.studyflow.backend.tasklist.repository.TaskListRepository;

@Service 
@Transactional (readOnly = true)
public class TaskService {

    private final AuthController authController;
    private final TaskRepository taskRepository;
    private final TaskListRepository taskListRepository;
    private final StatusRepository statusRepository;
    private final TaskTagRepository taskTagRepository;
    private final TagRepository tagRepository;


    public TaskService(TaskRepository taskRepository, TaskListRepository taskListRepository, StatusRepository statusRepository, TaskTagRepository taskTagRepository, TagRepository tagRepository, AuthController authController) {
        this.taskRepository = taskRepository;
        this.taskListRepository = taskListRepository;
        this.statusRepository = statusRepository;
        this.taskTagRepository = taskTagRepository;
        this.tagRepository = tagRepository;
        this.authController = authController;
    }

    @Transactional
    public TaskResponse create(Long userId, Long taskListId, TaskCreateRequest request) {
        TaskList taskList = lockTaskList(userId, taskListId);
        Status status = resolveStatus(taskListId, request.statusId());
        Task parent = resolveParent(taskListId, request.parentId());

        double sortOrder = (parent == null) ? TaskOrdering.after(taskRepository.findLastSortOrder(status.getId())) : TaskOrdering.after(taskRepository.findLastSortOrderByParentId(parent.getId()));

        Task task = Task.create(taskList, status, parent, request.title(), request.description(),
                request.priority(), request.dueDate(), sortOrder);
        return TaskResponse.from(taskRepository.save(task), List.of());
    }

    public List<TaskResponse> findAll(Long userId, Long taskListId, TaskSearchCondition condition) {
        getTaskList(userId, taskListId);

        Specification<Task> spec = buildSpec(userId, taskListId, condition);

        return toResponses(taskRepository.findAll(spec, Sort.by("status.id", "sortOrder", "id")));
    }

    public TaskResponse findById(Long userId, Long taskListId, Long taskId) {
        return toResponse(getTask(userId, taskListId, taskId));
    }

    @Transactional
    public TaskResponse update(Long userId, Long taskListId, Long taskId, TaskUpdateRequest request) {
        lockTaskList(userId, taskListId);
        
        Task task = taskRepository.findByIdAndTaskListId(taskId, taskListId).orElseThrow(() -> new BusinessException(ErrorCode.TASK_NOT_FOUND));

        task.update(request.title(), request.description(), request.priority(), request.dueDate());

        if (Boolean.TRUE.equals(request.clearDueDate())) {
            task.clearDueDate();
        }

        if (request.statusId() != null && !request.statusId().equals(task.getStatus().getId())) {
            Status status = getStatus(taskListId, request.statusId());
            double sortOrder = (task.getParent() == null) ? TaskOrdering.after(taskRepository.findLastSortOrder(status.getId())) : task.getSortOrder();

            task.changeStatus(status, sortOrder);
        }

        taskRepository.flush(); // 응답의 updatedAt 반영
        return toResponse(task);
    }

    @Transactional 
    public TaskResponse move(Long userId, Long taskListId, Long taskId, TaskMoveRequest request) {
        lockTaskList(userId, taskListId);
        Task task = findTaskInList(taskListId, taskId);

        if(task.getParent() != null) {
            throw new BusinessException(ErrorCode.SUBTASK_MOVE_NOT_SUPPORTED);
        }

        Status target = (request.statusId() == null) ? task.getStatus() : getStatus(taskListId, request.statusId());
        Task prev = findNeighbor(taskListId, task, target, request.prevTaskId());
        Task next = findNeighbor(taskListId, task, target, request.nextTaskId());

        // 앞뒤가 진짜 "바로 앞, 바로 뒤"인지: 순서가 맞고, 사이에 다른 카드가 없어야 한다.
        double low = (prev == null) ? 0.0 : prev.getSortOrder();
        double high = (next == null) ? Double.MAX_VALUE : next.getSortOrder();
        if (low >= high || taskRepository.existsInColumnBetween(target.getId(), task.getId(), low, high)) {
            throw new BusinessException(ErrorCode.INVALID_MOVE_TARGET);
        }

        if(!TaskOrdering.hasRoom(sortOrderOf(prev), sortOrderOf(next))) {
            rebalance(target.getId());
        }

        task.changeStatus(target, TaskOrdering.between(sortOrderOf(prev), sortOrderOf(next)));
        taskRepository.flush(); // 응답의 updatedAt 반영
        return toResponse(task);
    }

    private Task findTaskInList(Long taskListId, Long taskId) {
        return taskRepository.findByIdAndTaskListId(taskId, taskListId).orElseThrow(() -> new BusinessException(ErrorCode.TASK_NOT_FOUND));
    }

    // 앞뒤 카드는 같은 공책, 같은 열의 최상위 카드여야 하고, 옮기는 카드 자신이면 안된다.
    private Task findNeighbor(Long taskListId, Task moving, Status target, Long neighborId) {
        if(neighborId == null) { 
            return null;
        }

        Task neighbor = findTaskInList(taskListId, neighborId);
        if(neighbor.getId().equals(moving.getId()) || neighbor.getParent() != null || !neighbor.getStatus().getId().equals(target.getId())) {
            throw new BusinessException(ErrorCode.INVALID_MOVE_TARGET);
        }

        return neighbor;
    }
 
    private Double sortOrderOf(Task task) {
        return (task == null) ? null : task.getSortOrder();
    }

    // 열 전체를 GAP, 2GAP, 3GAP ... 으로 다시 매긴다(간격이 바닥났을 때만)
    private void rebalance(Long statusId) {
        List<Task> column = taskRepository.findAllByStatusIdAndParentIsNullOrderBySortOrderAscIdAsc(statusId);
        for(int i = 0; i < column.size(); i++) {
            column.get(i).changeSortOrder(TaskOrdering.nth(i));
        }
    }

    public List<TaskResponse> findSubtasks(Long userId, Long taskListId, Long taskId) {
        getTask(userId, taskListId, taskId);   // 소유권 확인 (부모가 내 것인가)
        return toResponses(taskRepository.findAllByParentIdOrderBySortOrderAscIdAsc(taskId));

    }

    @Transactional
    public void delete(Long userId, Long taskListId, Long taskId) {
        taskRepository.delete(getTask(userId, taskListId, taskId));
    }

    @Transactional 
    public TaskResponse addTag(Long userId, Long taskListId, Long taskId, Long tagId) {
        Task task = getTask(userId, taskListId, taskId); // Task 가 내 것인가 (목록 체인)
        Tag tag = getTag(userId, tagId);

        if(!taskTagRepository.existsByTaskIdAndTagId(taskId, tagId)) {
            taskTagRepository.save(TaskTag.create(task, tag));
        }

        return toResponse(task);
    }

    @Transactional 
    public TaskResponse removeTag(Long userId, Long taskListId, Long taskId, Long tagId) {
        Task task = getTask(userId, taskListId, taskId);
        getTag(userId, tagId);
        taskTagRepository.findByTaskIdAndTagId(taskId, tagId)
                .ifPresent(taskTagRepository::delete);
        return toResponse(task);
    }

    private TaskList getTaskList(Long userId, Long taskListId) {
        return taskListRepository.findByIdAndUserId(taskListId, userId).orElseThrow(() -> new BusinessException(ErrorCode.TASK_LIST_NOT_FOUND));
    }

    private TaskList lockTaskList(Long userId, Long taskListId) {
        return taskListRepository.findByIdAndUserIdForUpdate(taskListId, userId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.TASK_LIST_NOT_FOUND));
    }

    private Task getTask(Long userId, Long taskListId, Long taskId) {
        getTaskList(userId, taskListId);
        return taskRepository.findByIdAndTaskListId(taskId, taskListId).orElseThrow(() -> new BusinessException(ErrorCode.TASK_NOT_FOUND));
    }

    private Status getStatus(Long taskListId, Long statusId) {
        return statusRepository.findByIdAndTaskListId(statusId, taskListId).orElseThrow(() -> new BusinessException(ErrorCode.STATUS_NOT_FOUND));
    }

    private Tag getTag(Long userId, Long tagId) {
        return tagRepository.findByIdAndUserId(tagId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TAG_NOT_FOUND));
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


    private List<TaskResponse> toResponses(List<Task> tasks) {
        if(tasks.isEmpty()) {
            return List.of();
        }

        List<Long> taskIds = tasks.stream().map(Task::getId).toList();

        Map<Long, List<TagSummary>> tagsByTaskId= taskTagRepository.findAllWithTagByTaskIdIn(taskIds).stream().collect(Collectors.groupingBy(tt -> tt.getTask().getId(), Collectors.mapping(tt -> TagSummary.from(tt.getTag()), Collectors.toList())));


        return tasks.stream().map(task -> TaskResponse.from(task, tagsByTaskId.getOrDefault(task.getId(), List.of()))).toList();
    }
    private TaskResponse toResponse(Task task) {
        return toResponses(List.of(task)).getFirst();
    }


    private Specification<Task> buildSpec(Long userId, Long taskListId, TaskSearchCondition condition) {
        List<Specification<Task>> specs = new ArrayList<>();
        specs.add(belongsTo(taskListId));

        if (condition.statusId() != null) {
            getStatus(taskListId, condition.statusId());
            specs.add(hasStatus(condition.statusId()));
        }
        if (condition.tagId() != null) {
            getTag(userId, condition.tagId());
            specs.add(hasTag(condition.tagId()));
        }
        if (condition.priority() != null) {
            specs.add(hasPriority(condition.priority()));
        }
        if (condition.keyword() != null && !condition.keyword().isBlank()) {
            specs.add(containsKeyword(condition.keyword().strip()));
        }
        if (condition.dueFrom() != null) {
            specs.add(dueOnOrAfter(condition.dueFrom()));
        }
        if (condition.dueTo() != null) {
            specs.add(dueOnOrBefore(condition.dueTo()));
        }

        return Specification.allOf(specs);
    }
}
