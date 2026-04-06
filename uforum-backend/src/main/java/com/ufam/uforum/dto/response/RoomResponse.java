package com.ufam.uforum.dto.response;

import com.ufam.uforum.enums.RoomType;
import lombok.*;

import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RoomResponse {
    private UUID id;
    private UUID floorId;
    private UUID blockId;
    private String blockName;
    private String blockCode;
    private Integer floorNumber;
    private String name;
    private String number;
    private RoomType type;
    private Double x;
    private Double y;
    private Double width;
    private Double height;
    private String metadata;
}
