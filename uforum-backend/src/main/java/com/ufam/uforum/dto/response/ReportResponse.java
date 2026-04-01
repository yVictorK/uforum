package com.ufam.uforum.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record ReportResponse(
    UUID id,
    UserSummaryResponse reporter,
    UUID targetId,
    String targetType,
    String reason,
    String description,
    String status,
    UserSummaryResponse reviewedBy,
    String reviewerNotes,
    LocalDateTime createdAt
) {}
