package com.studyflow.backend.tag.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.studyflow.backend.global.response.ApiResponse;
import com.studyflow.backend.tag.dto.TagCreateRequest;
import com.studyflow.backend.tag.dto.TagResponse;
import com.studyflow.backend.tag.dto.TagUpdateRequest;
import com.studyflow.backend.tag.service.TagService;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;

@io.swagger.v3.oas.annotations.tags.Tag(name = "Tag", description = "태그 API")
@RestController
@RequestMapping("/api/tags")
public class TagController {

    private final TagService tagService;

    public TagController(TagService tagService) {
        this.tagService = tagService;
    }


    @Operation(summary = "태그 생성", description = "같은 이름의 태그가 이미 있으면 409를 반환합니다.")
    @PostMapping
    public ResponseEntity<ApiResponse<TagResponse>> create(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody TagCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(tagService.create(userId, request)));
    }

    @Operation(summary = "태그 전체 조회", description = "내 태그를 이름순으로 조회합니다.")
    @GetMapping 
    public ApiResponse<List<TagResponse>> findAll(@AuthenticationPrincipal Long userId) {
        return ApiResponse.ok(tagService.findAll(userId));
    }

    @Operation(summary = "태그 수정",
        description = "보낸 필드만 수정합니다. clearColor가 true이면 색상을 지웁니다. color와 clearColor는 함께 보낼 수 없습니다.")
    @PatchMapping ("/{tagId}")
    public ApiResponse<TagResponse> update(@AuthenticationPrincipal Long userId
                                            , @PathVariable Long tagId
                                            , @Valid @RequestBody TagUpdateRequest request) {
        return ApiResponse.ok(tagService.update(userId, tagId, request));
    }

    @Operation(summary = "태그 삭제", description = "태그를 삭제하면 할 일에 붙은 태그도 함께 제거됩니다.")
    @DeleteMapping ("/{tagId}")
    public ApiResponse<Void> delete(@AuthenticationPrincipal Long userId, @PathVariable Long tagId) {
        tagService.delete(userId, tagId);
        return ApiResponse.ok();
    }
}
