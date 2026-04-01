package com.ufam.uforum.entity;

import com.ufam.uforum.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_id")
    private User recipient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    private User actor; // quem disparou a notificação

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false, length = 300)
    private String message;

    @Column(name = "reference_id")
    private UUID referenceId; // ID do post, evento, produto, etc.

    @Column(name = "reference_type", length = 50)
    private String referenceType; // "POST", "EVENT", "PRODUCT", "USER"

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
