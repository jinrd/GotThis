package com.studyflow.backend.task.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.studyflow.backend.task.entity.TaskTag;

public interface TaskTagRepository extends JpaRepository<TaskTag, Long>{
    boolean existsByTaskIdAndTagId(Long taskId, Long tagId);
    Optional<TaskTag> findByTaskIdAndTagId(Long taskId, Long tagId); 

    @Query("select tt from TaskTag tt join fetch tt.tag where tt.task.id in :taskIds order by tt.tag.name")
    List<TaskTag> findAllWithTagByTaskIdIn(@Param("taskIds") Collection<Long> taskIds);
}
