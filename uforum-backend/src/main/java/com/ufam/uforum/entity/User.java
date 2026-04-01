package com.ufam.uforum.entity;

import com.ufam.uforum.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "student_id", unique = true, nullable = false, length = 20)
    private String studentId; // matrícula

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(length = 500)
    private String bio;

    private String course; // curso (ex: Ciência da Computação)
    private Integer semester; // período atual (1-10)
    private Integer age;
    private String neighborhood; // bairro

    @Column(name = "profile_picture_url")
    private String profilePictureUrl;

    @Column(name = "banner_url")
    private String bannerUrl;

    @Column(name = "whatsapp_number", length = 20)
    private String whatsappNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.STUDENT;

    @Column(name = "email_verified", nullable = false)
    @Builder.Default
    private Boolean emailVerified = false;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    // Matérias do semestre atual
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_current_subjects", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "subject")
    @Builder.Default
    private List<String> currentSubjects = new ArrayList<>();

    // Followers / Following
    @ManyToMany
    @JoinTable(name = "user_follows", joinColumns = @JoinColumn(name = "follower_id"), inverseJoinColumns = @JoinColumn(name = "following_id"))
    @Builder.Default
    private Set<User> following = new HashSet<>();

    @ManyToMany(mappedBy = "following")
    @Builder.Default
    private Set<User> followers = new HashSet<>();

    // Token de verificação de email
    @Column(name = "email_verification_token")
    private String emailVerificationToken;

    // Refresh token
    @Column(name = "refresh_token")
    private String refreshToken;

    @Column(name = "refresh_token_expiry")
    private LocalDateTime refreshTokenExpiry;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Helpers
    public int getFollowersCount() {
        return followers != null ? followers.size() : 0;
    }

    public int getFollowingCount() {
        return following != null ? following.size() : 0;
    }
}
