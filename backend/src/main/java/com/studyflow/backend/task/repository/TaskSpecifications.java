package com.studyflow.backend.task.repository;

import java.time.LocalDate;

import org.springframework.data.jpa.domain.Specification;

import com.studyflow.backend.task.entity.Priority;
import com.studyflow.backend.task.entity.Task;
import com.studyflow.backend.task.entity.TaskTag;

import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;

public final class TaskSpecifications {
    private TaskSpecifications(){}

    public static Specification<Task> belongsTo(Long taskListId) {
        return (root, query, cb) -> cb.equal(root.get("taskList").get("id"), taskListId);
    }

     public static Specification<Task> hasStatus(Long statusId) {
        return (root, query, cb) -> cb.equal(root.get("status").get("id"), statusId);
    }

    public static Specification<Task> hasPriority(Priority priority) {
        return (root, query, cb) -> cb.equal(root.get("priority"), priority);
    }

    public static Specification<Task> dueOnOrAfter(LocalDate from) {
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("dueDate"), from);
    }

    public static Specification<Task> dueOnOrBefore(LocalDate to) {
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("dueDate"), to);
    }

    public static Specification<Task> containsKeyword(String keyword) {
        return (root, query, cb) -> {
            String pattern = "%" + escapeLike(keyword.toLowerCase()) + "%";
            return cb.or(
                cb.like(cb.lower(root.get("title")), pattern, '\\'),
                cb.like(cb.lower(root.get("description")), pattern, '\\')
            );
        };
    }

    public static Specification<Task> hasTag(Long tagId) {
        return (root, query, cb) -> {
            Subquery<Long> sub = query.subquery(Long.class);
            Root<TaskTag> taskTag = sub.from(TaskTag.class);
            sub.select(taskTag.get("id"))
               .where(
                   cb.equal(taskTag.get("task"), root),
                   cb.equal(taskTag.get("tag").get("id"), tagId)
               );
            return cb.exists(sub);
        };
    }

    private static String escapeLike(String value) {
        return value.replace("\\", "\\\\")
                    .replace("%", "\\%")
                    .replace("_", "\\_");
    }
    
}
