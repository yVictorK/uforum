package com.ufam.uforum.dto.request;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;
public record CreateProductRequest(
    @NotBlank @Size(max = 200) String title,
    @NotBlank String description,
    @NotNull @DecimalMin("0.01") BigDecimal price,
    String category,
    List<String> imageUrls
) {}
