package com.studyflow.backend.auth.service;

import com.studyflow.backend.global.security.JwtProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.studyflow.backend.auth.dto.LoginRequest;
import com.studyflow.backend.auth.dto.SignupRequest;
import com.studyflow.backend.auth.dto.TokenResponse;
import com.studyflow.backend.global.exception.BusinessException;
import com.studyflow.backend.global.exception.ErrorCode;
import com.studyflow.backend.user.dto.UserResponse;
import com.studyflow.backend.user.entity.User;
import com.studyflow.backend.user.repository.UserRepository;

@Service 
@Transactional (readOnly = true)
public class AuthService {
    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtProvider jwtProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtProvider = jwtProvider;
    }

    @Transactional 
    public UserResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException(ErrorCode.DUPLICATE_EMAIL);
        }

        String encodedPassword = passwordEncoder.encode(request.password());
        User user = User.create(request.email(), encodedPassword, request.nickname());

        try {
            return UserResponse.from(userRepository.save(user));
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.DUPLICATE_EMAIL);
        }
    }

    public TokenResponse login(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.email()).orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));

        if(!passwordEncoder.matches(loginRequest.password(), user.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }

        return TokenResponse.bearer(jwtProvider.createAccessToken(user.getId()));
    }
}
