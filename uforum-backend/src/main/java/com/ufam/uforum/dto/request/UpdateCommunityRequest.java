package com.ufam.uforum.dto.request;
import jakarta.validation.constraints.*;
import org.hibernate.validator.constraints.URL;
public record UpdateCommunityRequest(
    @Size(min = 10, max = 500) String description,
    @URL(message = "URL de banner inválida") @Size(max = 2048, message = "A URL não pode exceder 2048 caracteres") String bannerUrl,
    @URL(message = "URL de ícone inválida") @Size(max = 2048, message = "A URL não pode exceder 2048 caracteres") String iconUrl
) {}
