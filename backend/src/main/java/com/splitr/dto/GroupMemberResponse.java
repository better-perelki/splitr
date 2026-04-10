package com.splitr.dto;

import com.splitr.entity.GroupRole;
import java.time.Instant;

public record GroupMemberResponse(
    UserSearchResponse user,
    GroupRole role,
    Instant joinedAt
) {}
