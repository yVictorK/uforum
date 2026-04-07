package com.ufam.uforum.dto.request;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;
public record CreateProductRequest(
    @NotBlank @Size(max = 200) String title,
    @NotBlank @Size(max = 5000) String description,
    @NotNull @DecimalMin("0.01") BigDecimal price,
    String category,
    @Size(max = 10, message = "Máximo de 10 imagens") List<@org.hibernate.validator.constraints.URL(message = "URL de imagem inválida") @Size(max = 2048, message = "A URL não pode exceder 2048 caracteres") String> imageUrls
) {}
