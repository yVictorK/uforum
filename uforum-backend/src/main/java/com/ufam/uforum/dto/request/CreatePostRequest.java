package com.ufam.uforum.dto.request;
import jakarta.validation.constraints.*;
import java.util.UUID;
public record CreatePostRequest(
    @Size(max = 300) String title,
    @NotBlank @Size(min = 1, max = 10000) String content,
    String imageUrl,
    UUID communityId,
    UUID parentId
) {}
