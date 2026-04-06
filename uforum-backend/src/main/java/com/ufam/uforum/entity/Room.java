package com.ufam.uforum.entity;

import com.ufam.uforum.enums.RoomType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "rooms")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "floor_id", nullable = false)
    private Floor floor;

    @Column(nullable = false, length = 100)
    private String name; // ex: "Laboratório de Software"

    @Column(length = 20)
    private String number; // ex: "FT-101"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomType type;

    // Coordenadas relativas (0-100 ou pixels base) para o Konva
    @Column(nullable = false)
    private Double x;

    @Column(nullable = false)
    private Double y;

    @Column(nullable = false)
    private Double width;

    @Column(nullable = false)
    private Double height;

    @Column(name = "metadata_json", columnDefinition = "TEXT")
    private String metadata; // ex: {"capacity": 30, "has_projector": true}

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
