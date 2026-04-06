package com.ufam.uforum.dto.request;

import com.ufam.uforum.enums.RoomType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateRoomRequest {

    @NotNull(message = "Floor ID is required")
    private UUID floorId;

    @NotBlank(message = "Name is required")
    private String name;

    private String number;

    @NotNull(message = "Room type is required")
    private RoomType type;

    @NotNull(message = "X coordinate is required")
    private Double x;

    @NotNull(message = "Y coordinate is required")
    private Double y;

    @NotNull(message = "Width is required")
    private Double width;

    @NotNull(message = "Height is required")
    private Double height;

    private String metadata;
}
