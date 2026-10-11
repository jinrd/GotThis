package com.studyflow.backend.tag.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.studyflow.backend.global.exception.BusinessException;
import com.studyflow.backend.global.exception.ErrorCode;
import com.studyflow.backend.tag.dto.TagCreateRequest;
import com.studyflow.backend.tag.dto.TagResponse;
import com.studyflow.backend.tag.dto.TagUpdateRequest;
import com.studyflow.backend.tag.entity.Tag;
import com.studyflow.backend.tag.repository.TagRepository;
import com.studyflow.backend.user.entity.User;
import com.studyflow.backend.user.repository.UserRepository;

@Service 
@Transactional (readOnly = true)
public class TagService {

    private final TagRepository tagRepository;
    private final UserRepository userRepository;

    public TagService(TagRepository tagRepository, UserRepository userRepository) {
        this.tagRepository = tagRepository;
        this.userRepository = userRepository;
    }

    @Transactional 
    public TagResponse create(Long userId, TagCreateRequest request) {
        if(tagRepository.existsByUserIdAndName(userId, request.name())) {
            throw new BusinessException(ErrorCode.DUPLICATE_TAG_NAME);
        }

        User user = userRepository.getReferenceById(userId);
        Tag saved = tagRepository.save(Tag.create(user, request.name(), request.color()));
        return TagResponse.from(saved);
    }

    public List<TagResponse> findAll(Long userId) {
        return tagRepository.findAllByUserIdOrderByNameAsc(userId).stream().map(TagResponse::from).toList();
    }

    @Transactional
    public TagResponse update(Long userId, Long tagId, TagUpdateRequest request) {
        Tag tag = getTag(userId, tagId);
        if (request.name() != null
                && tagRepository.existsByUserIdAndNameAndIdNot(userId, request.name(), tagId)) {
            throw new BusinessException(ErrorCode.DUPLICATE_TAG_NAME);
        }
        tag.update(request.name(), request.color());
        if (Boolean.TRUE.equals(request.clearColor())) {
            tag.clearColor();
        }
        tagRepository.flush(); // 응답의 updatedAt 반영
        return TagResponse.from(tag);
    }

    @Transactional 
    public void delete(Long userId, Long tagId) {
        Tag tag = getTag(userId, tagId);
        tagRepository.delete(tag);    
    }

    public Tag getTag(Long userId, Long tagId){
        return tagRepository.findByIdAndUserId(tagId, userId).orElseThrow(() -> new BusinessException(ErrorCode.TAG_NOT_FOUND));
    }
}
