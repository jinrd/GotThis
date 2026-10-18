package com.studyflow.backend.tasklist.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.studyflow.backend.tasklist.entity.TaskList;

import jakarta.persistence.LockModeType;

public interface TaskListRepository extends JpaRepository<TaskList, Long>{
    
    List<TaskList> findAllByUserIdOrderBySortOrderAscIdAsc(Long userId);

    Optional<TaskList> findByIdAndUserId(Long id, Long userId);

    @Query ("select max(t.sortOrder) from TaskList t where t.user.id = :userId")
    Double findLastSortOrder(@Param("userId") Long userId);

    @Lock (LockModeType.PESSIMISTIC_WRITE)
    @Query ("select t from TaskList t where t.id = :id and t.user.id = :userId")
    Optional<TaskList> findByIdAndUserIdForUpdate(@Param ("id") Long id, @Param ("userId") Long userId);

    // 사용자의 목록 중 low와 high 사이(양 끝 제외)에 다른 목록이 있는지
    @Query("""
            select case when count(t) > 0 then true else false end
            from TaskList t
            where t.user.id = :userId and t.id <> :excludeId
            and t.sortOrder > :low and t.sortOrder < :high
            """)
    boolean existsInUserBetween(@Param("userId") Long userId, @Param("excludeId") Long excludeId,
                                @Param("low") double low, @Param("high") double high);
}
