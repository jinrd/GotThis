package com.studyflow.backend.tag.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.studyflow.backend.tag.entity.Tag;

public interface TagRepository extends JpaRepository<Tag, Long>{
    List<Tag> findAllByUserIdOrderByNameAsc(Long userId);
    Optional<Tag> findByIdAndUserId(Long id, Long userId);
    boolean existsByUserIdAndName(Long userId, String name);
    boolean existsByUserIdAndNameAndIdNot(Long userId, String name, Long id);
}
