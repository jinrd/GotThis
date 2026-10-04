package com.studyflow.backend.global.security;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties (prefix = "jwt")
public record JwtProperties(String secret, Duration accessTokenExpiration) {}
