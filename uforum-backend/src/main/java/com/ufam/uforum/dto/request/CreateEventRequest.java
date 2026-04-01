package com.ufam.uforum.dto.request;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.UUID;
public record CreateEventRequest(
    @NotBlank @Size(max = 200) String title,
    @NotBlank String description,
    String imageUrl,
    @NotBlank String location,
    UUID mapBlockId,
    @NotNull @Future LocalDateTime startDate,
    LocalDateTime endDate,
    UUID communityId
) {}
