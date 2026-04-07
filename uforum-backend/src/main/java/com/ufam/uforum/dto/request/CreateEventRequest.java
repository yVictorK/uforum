package com.ufam.uforum.dto.request;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.UUID;
public record CreateEventRequest(
    @NotBlank @Size(max = 200) String title,
    @NotBlank String description,
    @org.hibernate.validator.constraints.URL(message = "URL de imagem inválida") @Size(max = 2048, message = "A URL não pode exceder 2048 caracteres") String imageUrl,
    @NotBlank String location,
    UUID mapBlockId,
    @NotNull @Future LocalDateTime startDate,
    LocalDateTime endDate,
    UUID communityId
) {}
