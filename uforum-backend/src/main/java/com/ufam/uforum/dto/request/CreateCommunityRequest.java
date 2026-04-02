package com.ufam.uforum.dto.request;
import jakarta.validation.constraints.*;
import org.hibernate.validator.constraints.URL;
public record CreateCommunityRequest(
    @NotBlank @Size(min = 3, max = 100) String name,
    @NotBlank @Size(min = 10, max = 500) String description,
    @URL(message = "URL de banner inválida") String bannerUrl,
    @URL(message = "URL de ícone inválida") String iconUrl,
    boolean isPrivate
) {}
