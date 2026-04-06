package com.splitr.dto;

import java.util.UUID;

public record UserSearchResponse(
        UUID id,
        String email,
        String phone,
        String username,
        String avatarUrl
) {}
