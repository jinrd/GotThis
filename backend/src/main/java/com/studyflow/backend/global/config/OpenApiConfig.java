package com.studyflow.backend.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;

@Configuration 
public class OpenApiConfig {

    @Bean 
    public OpenAPI openAPI() {
        return new OpenAPI().info(new Info().title("StudyFlow API")
                        .description("자유도 높은 할 일 관리 서비스 API")
                        .version("v1"));
    }
}
