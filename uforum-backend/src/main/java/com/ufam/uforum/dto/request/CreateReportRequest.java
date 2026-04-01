package com.ufam.uforum.dto.request;
import jakarta.validation.constraints.*;
import java.util.UUID;
public record CreateReportRequest(
    @NotNull UUID targetId,
    @NotBlank String targetType,
    @NotNull String reason,
    @Size(max = 500) String description
) {}
