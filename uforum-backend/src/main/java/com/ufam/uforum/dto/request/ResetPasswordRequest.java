package com.ufam.uforum.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
    @NotBlank(message = "Token é obrigatório")
    String token,

    @NotBlank(message = "Nova senha é obrigatória")
    @Size(min = 8, message = "Senha deve ter pelo menos 8 caracteres")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%*])[A-Za-z\\d!@#$%*]{8,}$",
             message = "Senha deve conter pelo menos: 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial (!@#$%*)")
    String newPassword
) {}
