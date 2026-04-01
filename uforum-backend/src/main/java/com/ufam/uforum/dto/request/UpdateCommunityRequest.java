package com.ufam.uforum.dto.request;
import jakarta.validation.constraints.*;
public record UpdateCommunityRequest(
    @Size(min = 10, max = 500) String description,
    String bannerUrl,
    String iconUrl
) {}
