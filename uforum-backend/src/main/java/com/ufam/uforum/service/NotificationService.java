package com.ufam.uforum.service;

import com.ufam.uforum.dto.response.NotificationResponse;
import com.ufam.uforum.dto.response.UserSummaryResponse;
import com.ufam.uforum.entity.Notification;
import com.ufam.uforum.entity.User;
import com.ufam.uforum.enums.NotificationType;
import com.ufam.uforum.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public Page<NotificationResponse> getMyNotifications(UUID userId, Pageable pageable) {
        return notificationRepository
            .findByRecipientIdOrderByCreatedAtDesc(userId, pageable)
            .map(this::toResponse);
    }

    public long countUnread(UUID userId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsRead(userId);
    }

    @Async
    @Transactional
    public void notifyNewFollower(User recipient, User actor) {
        if (recipient.getId().equals(actor.getId())) return;
        save(recipient, actor, NotificationType.NEW_FOLLOWER,
             actor.getFullName() + " começou a te seguir",
             actor.getId(), "USER");
    }

    @Async
    @Transactional
    public void notifyPostReply(User recipient, User actor, UUID postId) {
        if (recipient.getId().equals(actor.getId())) return;
        save(recipient, actor, NotificationType.POST_REPLY,
             actor.getFullName() + " respondeu ao seu post",
             postId, "POST");
    }

    @Async
    @Transactional
    public void notifyPostUpvote(User recipient, User actor, UUID postId) {
        if (recipient.getId().equals(actor.getId())) return;
        save(recipient, actor, NotificationType.POST_UPVOTE,
             actor.getFullName() + " curtiu seu post",
             postId, "POST");
    }

    @Async
    @Transactional
    public void notifyEventReminder(User recipient, UUID eventId, String eventTitle) {
        save(recipient, null, NotificationType.EVENT_REMINDER,
             "Lembrete: o evento \"" + eventTitle + "\" está chegando!",
             eventId, "EVENT");
    }

    @Transactional
    protected void save(User recipient, User actor, NotificationType type,
                      String message, UUID referenceId, String referenceType) {
        Notification notification = Notification.builder()
            .recipient(recipient)
            .actor(actor)
            .type(type)
            .message(message)
            .referenceId(referenceId)
            .referenceType(referenceType)
            .build();
        notificationRepository.save(notification);
    }

    private NotificationResponse toResponse(Notification n) {
        UserSummaryResponse actor = n.getActor() == null ? null : new UserSummaryResponse(
            n.getActor().getId(), n.getActor().getUsername(),
            n.getActor().getFullName(), n.getActor().getProfilePictureUrl(),
            n.getActor().getRole().name()
        );
        return new NotificationResponse(
            n.getId(), n.getType().name(), n.getMessage(),
            actor, n.getReferenceId(), n.getReferenceType(),
            n.getIsRead(), n.getCreatedAt()
        );
    }
}
