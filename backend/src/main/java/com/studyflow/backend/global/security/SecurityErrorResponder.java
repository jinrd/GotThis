package com.studyflow.backend.global.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

import com.studyflow.backend.global.exception.ErrorCode;
import com.studyflow.backend.global.response.ApiResponse;
import com.studyflow.backend.global.response.ErrorResponse;

import jakarta.servlet.http.HttpServletResponse;
import tools.jackson.databind.json.JsonMapper;

@Component 
public class SecurityErrorResponder {

    private final JsonMapper jsonMapper;

    public SecurityErrorResponder(JsonMapper jsonMapper) {
        this.jsonMapper = jsonMapper;
    }

    public void write(HttpServletResponse response, ErrorCode errorCode) throws IOException {
        ErrorResponse error = ErrorResponse.of(errorCode.code(), errorCode.message(), List.of());
        response.setStatus(errorCode.status().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write(jsonMapper.writeValueAsString(ApiResponse.fail(error)));
    }
}
