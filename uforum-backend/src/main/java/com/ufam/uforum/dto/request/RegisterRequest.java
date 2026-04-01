package com.ufam.uforum.dto.request;

import jakarta.validation.constraints.*;

public record RegisterRequest(
    @NotBlank(message = "Nome completo é obrigatório")
    @Size(min = 3, max = 100) String fullName,

    @NotBlank(message = "Username é obrigatório")
    @Size(min = 3, max = 50)
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username só pode conter letras, números e _")
    String username,

    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email inválido")
    @Pattern(regexp = ".*@(ufam\\.edu\\.br|alumni\\.ufam\\.edu\\.br)$",
             message = "Somente emails institucionais @ufam.edu.br são aceitos")
    String email,

    @NotBlank(message = "Matrícula é obrigatória")
    @Size(min = 6, max = 20) String studentId,

    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 8, message = "Senha deve ter pelo menos 8 caracteres")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
             message = "Senha deve conter pelo menos: 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial (@$!%*?&)")
    String password,

    String course,
    Integer semester
) {}
