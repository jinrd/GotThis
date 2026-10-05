package com.studyflow.backend.status.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.studyflow.backend.status.entity.Status;

public interface StatusRepository extends JpaRepository<Status, Long>{
    List<Status> findAllByTaskListIdOrderBySortOrderAsc(Long taskListId);
    Optional<Status> findByIdAndTaskListId(Long id, Long taskListId);
    boolean existsByTaskListIdAndName(Long taskListId, String name);
    boolean existsByTaskListIdAndNameAndIdNot(Long taskListId, String name, Long id);
    long countByTaskListId(Long taskListId);

    @Query ("select coalesce(max(s.sortOrder), 0) from Status s where s.taskList.id = :taskListId")
    int findMaxSortOrder(@Param ("taskListId") Long taskListId);

    Optional<Status> findFirstByTaskListIdOrderBySortOrderAsc(Long taskListId);
}
