package com.ufam.uforum.dto.request;

import jakarta.validation.constraints.*;

public record CreateMapBlockRequest(
    @NotBlank @Size(max = 100) String name,
    @NotBlank @Size(max = 20) String code,
    @Size(max = 500) String description,
    @NotNull Double latitude,
    @NotNull Double longitude,
    String polygonCoords,
    Integer floorCount,
    Integer roomsPerFloor
) {}
