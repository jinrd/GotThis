package com.studyflow.backend.task.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.studyflow.backend.task.entity.Task;

public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task>{

    Optional<Task> findByIdAndTaskListId(Long id, Long taskListId);

    boolean existsByStatusId(Long statusId);
    
    @Query ("select max(t.sortOrder) from Task t where t.status.id = :statusId and t.parent is null" )
    Double findLastSortOrder(@Param ("statusId") Long statusId);

    @Query ("select max(t.sortOrder) from Task t where t.parent.id = :parentId")
    Double findLastSortOrderByParentId(@Param ("parentId") Long parentId);

    List<Task> findAllByParentIdOrderBySortOrderAscIdAsc(Long parentId);

    // 한 열의 최상위 카드 전체 (재정렬용)
    List<Task> findAllByStatusIdAndParentIsNullOrderBySortOrderAscIdAsc(Long statusId);

    // 열 안에서 low와 high 사이(양 끝 제외)에 다른 카드가 있는지
    @Query("""
            select case when count(t) > 0 then true else false end
            from Task t
            where t.status.id = :statusId and t.parent is null and t.id <> :excludeId
            and t.sortOrder > :low and t.sortOrder < :high
            """)
    boolean existsInColumnBetween(@Param("statusId") Long statusId, @Param("excludeId") Long excludeId,
                                @Param("low") double low, @Param("high") double high);

        // 필드 삭제: 목록의 모든 Task에서 해당 키 제거
        @Modifying
        @Query(value = """
                update task set properties = properties - :key
                where task_list_id = :taskListId and jsonb_exists(properties, :key)
                """, nativeQuery = true)
        int removeProperty(@Param("taskListId") Long taskListId, @Param("key") String key);

        // SELECT 선택지 축소: 남은 선택지에 없는 값만 제거
        @Modifying
        @Query(value = """
                update task set properties = properties - :key
                where task_list_id = :taskListId and jsonb_exists(properties, :key)
                and properties ->> :key not in (:options)
                """, nativeQuery = true)
        int removePropertyValuesNotIn(@Param("taskListId") Long taskListId,
                                @Param("key") String key,
                                @Param("options") List<String> options);
}
