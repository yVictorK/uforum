package com.ufam.uforum.dto.response;
import java.util.UUID;
public record MapBlockResponse(
    UUID id, String name, String code, String description,
    Double latitude, Double longitude, String polygonCoords, Integer floorCount
) {}
