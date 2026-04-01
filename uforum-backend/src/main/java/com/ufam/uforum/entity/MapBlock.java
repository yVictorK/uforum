package com.ufam.uforum.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "map_blocks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MapBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name; // ex: "Bloco A - FT", "Biblioteca Central"

    @Column(nullable = false, length = 20)
    private String code; // ex: "FT-A", "BCT"

    @Column(length = 500)
    private String description;

    // Coordenadas do centro do bloco
    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    // Polígono simples para desenhar o bloco no mapa (JSON com array de pontos)
    @Column(name = "polygon_coords", columnDefinition = "TEXT")
    private String polygonCoords; // JSON: [[lat,lng],[lat,lng],...]

    @Column(name = "floor_count")
    @Builder.Default
    private Integer floorCount = 1;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
