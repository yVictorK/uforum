package com.ufam.uforum.dto.response;
import java.time.LocalDateTime;
import java.util.UUID;
public record NotificationResponse(
    UUID id, String type, String message,
    UserSummaryResponse actor, UUID referenceId, String referenceType,
    boolean isRead, LocalDateTime createdAt
) {}
