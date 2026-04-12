package com.splitr.dto;

import java.util.UUID;

public record SendFriendRequest(
        UUID receiverId
) {}