package com.ufam.uforum.dto.response;
import java.time.LocalDateTime;
import java.util.UUID;
public record EventResponse(
    UUID id, String title, String description, String imageUrl,
    String location, UUID mapBlockId, String mapBlockName,
    LocalDateTime startDate, LocalDateTime endDate,
    int attendeesCount, boolean isAttending,
    UserSummaryResponse createdBy, UUID communityId,
    LocalDateTime createdAt
) {}
