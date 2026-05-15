package com.splitr.dto;

import com.splitr.entity.NotificationType;
import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        NotificationType type,
        String title,
        String message,
        String link,
        String actorUsername,
        String actorAvatarUrl,
        boolean read,
        Instant createdAt
) {}
