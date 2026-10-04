package com.studyflow.backend.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration 
public class OpenApiConfig {

    private static final String JWT_SCHEME = "bearerAuth";

    @Bean 
    public OpenAPI openAPI() {
        return new OpenAPI().info(new Info().title("StudyFlow API")
                        .description("자유도 높은 할 일 관리 서비스 API")
                        .version("v1"))
                        .components(new Components()
                            .addSecuritySchemes(JWT_SCHEME, new SecurityScheme()
                            .type(SecurityScheme.Type.HTTP)
                            .scheme("bearer")
                            .bearerFormat("JWT")))
                        .addSecurityItem(new SecurityRequirement().addList(JWT_SCHEME));
    }
}
