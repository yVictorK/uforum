package com.ufam.uforum.dto.response;
import java.util.UUID;
public record UserSummaryResponse(UUID id, String username, String fullName, String profilePictureUrl, String role, boolean isFollowing) {}
