package com.ufam.uforum.dto.request;
import jakarta.validation.constraints.*;
public record CreateCommunityRequest(
    @NotBlank @Size(min = 3, max = 100) String name,
    @NotBlank @Size(min = 10, max = 500) String description,
    String bannerUrl, String iconUrl,
    boolean isPrivate
) {}
