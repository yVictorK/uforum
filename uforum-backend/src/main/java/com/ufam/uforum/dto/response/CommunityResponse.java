package com.ufam.uforum.dto.response;
import java.time.LocalDateTime;
import java.util.UUID;
public record CommunityResponse(
    UUID id, String name, String slug, String description,
    String bannerUrl, String iconUrl, boolean isPrivate,
    long memberCount, UserSummaryResponse createdBy,
    boolean isMember, LocalDateTime createdAt
) {}
