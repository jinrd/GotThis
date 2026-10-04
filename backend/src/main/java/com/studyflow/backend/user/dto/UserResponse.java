package com.studyflow.backend.user.dto;

import com.studyflow.backend.user.entity.User;

public record UserResponse(Long id, String email, String nickname) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getNickname());
    }
}
