package com.ufam.uforum.dto.request;

import com.ufam.uforum.enums.RoomType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateRoomRequest(
    @NotBlank String name,
    String number,
    @NotNull RoomType type
) {}
