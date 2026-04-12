package com.splitr.dto;

import com.splitr.entity.FriendRequestStatus;

import java.time.Instant;
import java.util.UUID;

public record FriendRequestDetails(UUID id,
                                   UserSummary sender,
                                   UserSummary receiver,
                                   FriendRequestStatus status,
                                   Instant createdAt) {
}
