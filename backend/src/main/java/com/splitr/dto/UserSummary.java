package com.splitr.dto;

import java.util.UUID;

public record UserSummary(
        UUID id,
        String username,
        String email,
        String avatarUrl
) {}
