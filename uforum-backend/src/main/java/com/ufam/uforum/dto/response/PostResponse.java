package com.ufam.uforum.dto.response;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
public record PostResponse(
    UUID id, String title, String content, String imageUrl,
    UserSummaryResponse author, UUID communityId, String communityName, String communitySlug,
    UUID parentId, int depth, int upvotesCount, int downvotesCount,
    int score, int repliesCount, boolean isDeleted, boolean isPinned,
    String currentUserVote, boolean isSaved, LocalDateTime createdAt, LocalDateTime updatedAt,
    List<PostResponse> ancestry
) {}
