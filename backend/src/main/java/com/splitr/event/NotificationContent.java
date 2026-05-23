package com.splitr.event;

import com.splitr.entity.NotificationType;

public record NotificationContent(NotificationType type, String title, String message, String link) {

    public static NotificationContent from(NotificationEvent event) {
        return switch (event) {
            case NotificationEvent.ExpenseAdded e -> new NotificationContent(
                    NotificationType.EXPENSE_ADDED,
                    "New expense",
                    e.actorUsername() + " added '" + e.description() + "' ("
                            + e.amount().toPlainString() + " " + e.currency() + ")",
                    "/groups/" + e.groupId()
            );
            case NotificationEvent.SettlementCreated e -> new NotificationContent(
                    NotificationType.SETTLEMENT_RECEIVED,
                    "Payment received",
                    e.actorUsername() + " settled "
                            + e.amount().toPlainString() + " " + e.currency() + " with you",
                    "/groups/" + e.groupId()
            );
            case NotificationEvent.FriendRequestSent e -> new NotificationContent(
                    NotificationType.FRIEND_REQUEST,
                    "Friend request",
                    e.actorUsername() + " sent you a friend request",
                    "/friends"
            );
            case NotificationEvent.FriendRequestAccepted e -> new NotificationContent(
                    NotificationType.FRIEND_REQUEST,
                    "Friend request accepted",
                    e.actorUsername() + " accepted your friend request",
                    "/friends"
            );
            case NotificationEvent.GroupMemberAdded e -> new NotificationContent(
                    NotificationType.GROUP_ADDED,
                    "Added to group",
                    e.actorUsername() + " added you to '" + e.groupName() + "'",
                    "/groups/" + e.groupId()
            );
        };
    }
}
