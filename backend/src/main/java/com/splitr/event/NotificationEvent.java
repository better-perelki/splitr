package com.splitr.event;

import java.math.BigDecimal;
import java.util.UUID;

public sealed interface NotificationEvent {

    UUID recipientId();

    UUID actorId();

    record ExpenseAdded(
            UUID recipientId,
            UUID actorId,
            UUID groupId,
            String actorUsername,
            String description,
            BigDecimal amount,
            String currency
    ) implements NotificationEvent {}

    record SettlementCreated(
            UUID recipientId,
            UUID actorId,
            UUID groupId,
            String actorUsername,
            BigDecimal amount,
            String currency
    ) implements NotificationEvent {}

    record FriendRequestSent(
            UUID recipientId,
            UUID actorId,
            String actorUsername
    ) implements NotificationEvent {}

    record FriendRequestAccepted(
            UUID recipientId,
            UUID actorId,
            String actorUsername
    ) implements NotificationEvent {}

    record GroupMemberAdded(
            UUID recipientId,
            UUID actorId,
            UUID groupId,
            String actorUsername,
            String groupName
    ) implements NotificationEvent {}
}
