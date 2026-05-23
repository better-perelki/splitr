package com.splitr.event;

import com.splitr.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class NotificationEventListener {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventListener.class);

    private final NotificationService notificationService;

    public NotificationEventListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void on(NotificationEvent event) {
        try {
            NotificationContent content = NotificationContent.from(event);
            notificationService.create(
                    event.recipientId(),
                    event.actorId(),
                    content.type(),
                    content.title(),
                    content.message(),
                    content.link()
            );
        } catch (Exception ex) {
            log.warn("Failed to deliver notification for event {}", event, ex);
        }
    }
}
