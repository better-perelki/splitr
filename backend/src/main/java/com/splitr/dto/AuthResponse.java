package com.splitr.dto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        UserProfileResponse user
) {}
