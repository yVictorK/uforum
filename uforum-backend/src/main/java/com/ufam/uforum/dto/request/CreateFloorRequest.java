package com.ufam.uforum.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateFloorRequest {

    @NotNull(message = "Block ID is required")
    private UUID blockId;

    @NotNull(message = "Floor number is required")
    @Min(value = 0, message = "Floor number must be at least 0")
    private Integer number;

    @NotBlank(message = "Name is required")
    private String name;
}
