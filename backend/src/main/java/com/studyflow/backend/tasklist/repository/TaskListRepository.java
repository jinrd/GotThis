package com.studyflow.backend.tasklist.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.studyflow.backend.tasklist.entity.TaskList;

public interface TaskListRepository extends JpaRepository<TaskList, Long>{
    List<TaskList> findAllByOrderBySortOrderAsc();

    @Query("select coalesce(max(t.sortOrder), 0) from TaskList t")
    int findMaxSortOrder();
}
