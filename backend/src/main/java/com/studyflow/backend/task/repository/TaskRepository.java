package com.studyflow.backend.task.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.studyflow.backend.task.entity.Task;

public interface TaskRepository extends JpaRepository<Task, Long>{

    List<Task> findAllByTaskListIdOrderByStatusIdAscSortOrderAsc(Long taskListId);

    Optional<Task> findByIdAndTaskListId(Long id, Long taskListId);

    boolean existsByStatusId(Long statusId);

    @Query("select coalesce(max(t.sortOrder), 0) from Task t where t.status.id = :statusId and t.parent is null")
    int findMaxSortOrder(@Param("statusId") Long statusId);

    @Query("select coalesce(max(t.sortOrder), 0) from Task t where t.parent.id = :parentId")
    int findMaxSortOrderByParentId(@Param("parentId") Long parentId);

    List<Task> findAllByParentIdOrderBySortOrderAsc(Long parentId);
}
