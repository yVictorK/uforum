package com.ufam.uforum.dto.request;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;
public record UpdateProductRequest(
    @Size(max = 200) String title,
    @Size(max = 5000) String description,
    @DecimalMin("0.01") BigDecimal price,
    String category,
    @Size(max = 10, message = "Máximo de 10 imagens") List<@org.hibernate.validator.constraints.URL(message = "URL de imagem inválida") String> imageUrls
) {}
