package com.splitr.service;

import com.splitr.dto.NotificationResponse;
import com.splitr.entity.Notification;
import com.splitr.entity.NotificationType;
import com.splitr.entity.User;
import com.splitr.exception.ResourceNotFoundException;
import com.splitr.exception.UnauthorizedException;
import com.splitr.repository.NotificationRepository;
import com.splitr.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    /**
     * Persists a notification in a dedicated transaction. REQUIRES_NEW is necessary because
     * this is invoked from {@code @TransactionalEventListener(AFTER_COMMIT)}, where the parent
     * transaction is already committed and any work attached to its synchronization context
     * would silently be discarded.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void create(UUID recipientId, UUID actorId, NotificationType type,
                       String title, String message, String link) {
        Notification notification = new Notification();
        notification.setUser(userRepository.getReferenceById(recipientId));
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setLink(link);
        if (actorId != null) {
            notification.setActor(userRepository.getReferenceById(actorId));
        }
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getUserNotifications(UUID userId, Pageable pageable) {
        return notificationRepository.findPageWithActor(userId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public void markAsRead(UUID userId, UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!notification.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Notification does not belong to this user");
        }
        notification.setRead(true);
    }

    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsRead(userId);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        User actor = notification.getActor();
        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getLink(),
                actor != null ? actor.getUsername() : null,
                actor != null ? actor.getAvatarUrl() : null,
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}
