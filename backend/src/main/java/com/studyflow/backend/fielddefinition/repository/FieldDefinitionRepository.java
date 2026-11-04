package com.studyflow.backend.fielddefinition.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.studyflow.backend.fielddefinition.entity.FieldDefinition;

public interface FieldDefinitionRepository extends JpaRepository<FieldDefinition, Long>{
    List<FieldDefinition> findAllByTaskListIdOrderBySortOrderAscIdAsc(Long taskListId);
    Optional<FieldDefinition> findByIdAndTaskListId(Long id, Long taskListId);
    boolean existsByTaskListIdAndName(Long taskListId, String name);
    boolean existsByTaskListIdAndNameAndIdNot(Long taskListId, String name, Long id);

    @Query("select max(f.sortOrder) from FieldDefinition f where f.taskList.id = :taskListId")
    Double findLastSortOrder(@Param("taskListId") Long taskListId);
}
