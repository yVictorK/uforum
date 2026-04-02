package com.ufam.uforum.dto.response;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
public record UserProfileResponse(
    UUID id, String username, String fullName, String email,
    String bio, String course, Integer semester, Integer age,
    String neighborhood, String profilePictureUrl, String bannerUrl, String whatsappNumber,
    List<String> currentSubjects, long followersCount, long followingCount,
    long postsCount, String role, boolean isFollowing, LocalDateTime createdAt
) {}
