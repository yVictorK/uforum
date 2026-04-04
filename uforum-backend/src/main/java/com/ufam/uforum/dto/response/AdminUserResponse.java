package com.ufam.uforum.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record AdminUserResponse(
    UUID id,
    String username,
    String email,
    String fullName,
    String role,
    Boolean isActive,
    LocalDateTime createdAt
) {}
