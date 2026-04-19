package com.splitr.repository;

import com.splitr.entity.FriendRequest;
import com.splitr.entity.FriendRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, UUID> {

    Optional<FriendRequest> findBySenderIdAndReceiverId(UUID senderId, UUID receiverId);

    @Query("""
        SELECT COUNT(fr) > 0 FROM FriendRequest fr
        WHERE ((fr.sender.id = :userId1 AND fr.receiver.id = :userId2)
           OR (fr.sender.id = :userId2 AND fr.receiver.id = :userId1))
        AND fr.status = :status
    """)
    boolean existsByUsersAndStatus(@Param("userId1") UUID userId1,
                                   @Param("userId2") UUID userId2,
                                   @Param("status") FriendRequestStatus status);
    List<FriendRequest> findByReceiverIdAndStatus(UUID receiverId, FriendRequestStatus status);

    List<FriendRequest> findBySenderIdAndStatus(UUID senderId, FriendRequestStatus status);

    @Query("""
        SELECT fr FROM FriendRequest fr
        WHERE (fr.sender.id = :userId OR fr.receiver.id = :userId)
        AND fr.status = com.splitr.entity.FriendRequestStatus.ACCEPTED
    """)
    List<FriendRequest> findAcceptedForUser(UUID userId);

    @Query("""
    SELECT fr FROM FriendRequest fr
    WHERE
        (fr.sender.id = :user1 AND fr.receiver.id = :user2)
        OR
        (fr.sender.id = :user2 AND fr.receiver.id = :user1)
""")
    Optional<FriendRequest> findRelationBetweenUsers(UUID user1, UUID user2);
}