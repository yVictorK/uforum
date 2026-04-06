package com.ufam.uforum.dto.response;

import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FloorResponse {
    private UUID id;
    private UUID blockId;
    private Integer number;
    private String name;
    private List<RoomResponse> rooms;
}
