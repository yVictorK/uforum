package com.ufam.uforum.dto.response;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
public record ProductResponse(
    UUID id, String title, String description, BigDecimal price,
    String category, String status, List<String> imageUrls,
    UserSummaryResponse seller, String sellerWhatsapp,
    LocalDateTime createdAt
) {}
