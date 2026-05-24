package com.splitr.dto;

import java.time.Instant;
import java.util.UUID;

public record UserProfileResponse(
        UUID id,
        String email,
        String phone,
        String username,
        String avatarUrl,
        String defaultCurrency,
        Instant createdAt
) {}
