package com.ufam.uforum.dto.request;
import jakarta.validation.constraints.*;
import java.util.UUID;
public record CreateReportRequest(
    @NotNull UUID targetId,
    @NotBlank @Pattern(regexp = "POST|USER|COMMUNITY", message = "targetType deve ser POST, USER ou COMMUNITY")
    String targetType,
    @NotBlank @Pattern(regexp = "SPAM|HARASSMENT|HATE_SPEECH|INAPPROPRIATE|MISINFORMATION|OTHER",
        message = "Motivo de denúncia inválido")
    String reason,
    @Size(max = 500) String description
) {}
