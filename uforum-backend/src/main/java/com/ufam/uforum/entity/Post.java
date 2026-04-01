package com.ufam.uforum.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "posts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(length = 300)
    private String title; // null quando for resposta

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "image_url")
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id")
    private User author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id")
    private Community community;

    // Referência ao post pai (para respostas aninhadas)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Post parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Post> replies = new ArrayList<>();

    // Nível de aninhamento (0 = post raiz, 1 = resposta, 2 = resposta de resposta...)
    @Column(nullable = false)
    @Builder.Default
    private Integer depth = 0;

    @Column(name = "upvotes_count", nullable = false)
    @Builder.Default
    private Integer upvotesCount = 0;

    @Column(name = "downvotes_count", nullable = false)
    @Builder.Default
    private Integer downvotesCount = 0;

    @Column(name = "replies_count", nullable = false)
    @Builder.Default
    private Integer repliesCount = 0;

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private Boolean isDeleted = false;

    @Column(name = "is_pinned", nullable = false)
    @Builder.Default
    private Boolean isPinned = false;

    // Usuários que salvaram este post
    @ManyToMany
    @JoinTable(
        name = "post_saves",
        joinColumns = @JoinColumn(name = "post_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @Builder.Default
    private Set<User> savedBy = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public int getScore() { return upvotesCount - downvotesCount; }
}
