package com.ufam.uforum.dto.request;
import jakarta.validation.constraints.*;
import org.hibernate.validator.constraints.URL;
import java.util.List;
public record UpdateProfileRequest(
    @Size(max = 100) String fullName,
    @Size(max = 500) String bio,
    String course,
    @Min(1) @Max(12) Integer semester,
    @Min(16) @Max(100) Integer age,
    String neighborhood,
    @URL(message = "URL de foto de perfil inválida") @Size(max = 2048, message = "A URL não pode exceder 2048 caracteres") String profilePictureUrl,
    @URL(message = "URL de banner inválida") @Size(max = 2048, message = "A URL não pode exceder 2048 caracteres") String bannerUrl,
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Número de WhatsApp inválido")
    String whatsappNumber,
    List<String> currentSubjects
) {}
