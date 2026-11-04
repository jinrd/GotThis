package com.studyflow.backend.fielddefinition.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.studyflow.backend.fielddefinition.dto.FieldDefinitionCreateRequest;
import com.studyflow.backend.fielddefinition.dto.FieldDefinitionResponse;
import com.studyflow.backend.fielddefinition.dto.FieldDefinitionUpdateRequest;
import com.studyflow.backend.fielddefinition.entity.FieldDefinition;
import com.studyflow.backend.fielddefinition.entity.FieldType;
import com.studyflow.backend.fielddefinition.repository.FieldDefinitionRepository;
import com.studyflow.backend.global.exception.BusinessException;
import com.studyflow.backend.global.exception.ErrorCode;
import com.studyflow.backend.global.ordering.GapOrdering;
import com.studyflow.backend.task.repository.TaskRepository;
import com.studyflow.backend.tasklist.entity.TaskList;
import com.studyflow.backend.tasklist.repository.TaskListRepository;

@Service 
@Transactional (readOnly = true)
public class FieldDefinitionService {
    private final FieldDefinitionRepository fieldDefinitionRepository;
    private final TaskListRepository taskListRepository;
    private final TaskRepository taskRepository;

    public FieldDefinitionService(FieldDefinitionRepository fieldDefinitionRepository, TaskListRepository taskListRepository, TaskRepository taskRepository) {
        this.fieldDefinitionRepository = fieldDefinitionRepository;
        this.taskListRepository = taskListRepository;
        this.taskRepository = taskRepository;
    }

    @Transactional 
    public FieldDefinitionResponse create(Long userId, Long taskListId, FieldDefinitionCreateRequest request) {
        TaskList taskList = lockTaskList(userId, taskListId);

        if(fieldDefinitionRepository.existsByTaskListIdAndName(taskListId, request.name())) {
            throw new BusinessException(ErrorCode.DUPLICATE_FIELD_NAME);
        }

        double sortOrder = GapOrdering.after(fieldDefinitionRepository.findLastSortOrder(taskListId));
        FieldDefinition field = FieldDefinition.create(taskList, request.name(), request.type(), request.options(), sortOrder);

        return FieldDefinitionResponse.from(fieldDefinitionRepository.save(field));
    }

    public List<FieldDefinitionResponse> findAll(Long userId, Long taskListID) {
        getTaskList(userId, taskListID); // 소유권 확인만
        return fieldDefinitionRepository.findAllByTaskListIdOrderBySortOrderAscIdAsc(taskListID).stream().map(FieldDefinitionResponse::from).toList();
    }

    @Transactional 
    public FieldDefinitionResponse update(Long userId, Long taskListId, Long fieldId, FieldDefinitionUpdateRequest request) {
        lockTaskList(userId, taskListId);
        FieldDefinition field = findFieldInList(taskListId, fieldId);

        if(request.name() != null && fieldDefinitionRepository.existsByTaskListIdAndNameAndIdNot(taskListId, request.name(), fieldId)) {
            throw new BusinessException(ErrorCode.DUPLICATE_FIELD_NAME);
        }

        if (request.options() != null) {
            if (field.getType() != FieldType.SELECT) {
                throw new BusinessException(ErrorCode.FIELD_OPTIONS_NOT_ALLOWED);
            }
            field.changeOptions(request.options());
            taskRepository.removePropertyValuesNotIn(taskListId, field.propertyKey(), request.options());
        }

        if (request.name() != null) {
            field.rename(request.name());
        }

        return FieldDefinitionResponse.from(field);
    }

    @Transactional
    public void delete(Long userId, Long taskListId, Long fieldId) {
        lockTaskList(userId, taskListId);
        FieldDefinition field = findFieldInList(taskListId, fieldId);

        taskRepository.removeProperty(taskListId, field.propertyKey());
        fieldDefinitionRepository.delete(field);
    }

    private TaskList lockTaskList(Long userId, Long taskListId) {
        return taskListRepository.findByIdAndUserIdForUpdate(taskListId, userId)
                            .orElseThrow(() -> new BusinessException(ErrorCode.TASK_LIST_NOT_FOUND));
    }

    private TaskList getTaskList(Long userId, Long taskListId) {
        return taskListRepository.findByIdAndUserId(taskListId, userId).orElseThrow(() -> new BusinessException(ErrorCode.TASK_LIST_NOT_FOUND));
    }

    // lockTaskList, getTaskList: StatusService와 같은 코드 (의도적 중복)
    private FieldDefinition findFieldInList(Long taskListId, Long fieldId) {
        return fieldDefinitionRepository.findByIdAndTaskListId(fieldId, taskListId)
                .orElseThrow(() -> new BusinessException(ErrorCode.FIELD_NOT_FOUND));
    }
}
