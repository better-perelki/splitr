package com.splitr.repository;

import com.splitr.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    @Query(value = "SELECT n FROM Notification n LEFT JOIN FETCH n.actor "
            + "WHERE n.user.id = :userId ORDER BY n.createdAt DESC",
            countQuery = "SELECT count(n) FROM Notification n WHERE n.user.id = :userId")
    Page<Notification> findPageWithActor(UUID userId, Pageable pageable);

    long countByUserIdAndReadFalse(UUID userId);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.user.id = :userId AND n.read = false")
    void markAllAsRead(UUID userId);
}
