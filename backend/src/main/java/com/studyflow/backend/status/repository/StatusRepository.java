package com.studyflow.backend.status.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.studyflow.backend.status.entity.Status;

public interface StatusRepository extends JpaRepository<Status, Long>{
    List<Status> findAllByTaskListIdOrderBySortOrderAscIdAsc(Long taskListId);
    Optional<Status> findByIdAndTaskListId(Long id, Long taskListId);
    boolean existsByTaskListIdAndName(Long taskListId, String name);
    boolean existsByTaskListIdAndNameAndIdNot(Long taskListId, String name, Long id);
    long countByTaskListId(Long taskListId);

    @Query ("select max(s.sortOrder) from Status s where s.taskList.id = :taskListId")
    Double findLastSortOrder(@Param("taskListId") Long taskListId);

    Optional<Status> findFirstByTaskListIdOrderBySortOrderAscIdAsc(Long taskListId);

    // 공책 안에서 low와 high 사이(양 끝 제외)에 다른 상태가 있는지
    @Query("""
            select case when count(s) > 0 then true else false end
            from Status s
            where s.taskList.id = :taskListId and s.id <> :excludeId
            and s.sortOrder > :low and s.sortOrder < :high
            """)
    boolean existsInListBetween(@Param ("taskListId") Long taskListId, @Param ("excludeId") Long excludeId, @Param ("low") double low, @Param ("high") double high);
}
