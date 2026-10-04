package com.studyflow.backend.tasklist.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.studyflow.backend.tasklist.entity.TaskList;

public interface TaskListRepository extends JpaRepository<TaskList, Long>{
    
    List<TaskList> findAllByUserIdOrderBySortOrderAsc(Long userId);

    Optional<TaskList> findByIdAndUserId(Long id, Long userId);

    @Query("select coalesce(max(t.sortOrder), 0) from TaskList t where t.user.id = :userId")
    int findMaxSortOrder(@Param("userId") Long userId);
}
