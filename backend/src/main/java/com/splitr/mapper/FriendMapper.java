package com.splitr.mapper;

import com.splitr.dto.*;
import com.splitr.entity.FriendRequest;
import com.splitr.entity.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component
public class FriendMapper {


    public UserSummary toUserSummary(User user) {
        return new UserSummary(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getAvatarUrl()
        );
    }


    public FriendRequestDetails toFriendRequestDetails(FriendRequest fr) {
        return new FriendRequestDetails(
                fr.getId(),
                toUserSummary(fr.getSender()),
                toUserSummary(fr.getReceiver()),
                fr.getStatus(),
                fr.getCreatedAt()
        );
    }


    public Friendship toFriendship(FriendRequest fr, UUID currentUserId) {
        User other = fr.getSender().getId().equals(currentUserId)
                ? fr.getReceiver()
                : fr.getSender();

        return new Friendship(
                fr.getId(),
                toUserSummary(other),
                BigDecimal.ZERO
        );
    }
}