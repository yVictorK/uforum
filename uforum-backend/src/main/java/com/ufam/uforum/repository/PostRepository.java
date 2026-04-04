package com.ufam.uforum.repository;

import com.ufam.uforum.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {

    @Query(value = "SELECT p FROM Post p JOIN FETCH p.author LEFT JOIN FETCH p.community " +
           "WHERE p.community.id = :communityId AND p.parent IS NULL AND p.isDeleted = false",
           countQuery = "SELECT COUNT(p) FROM Post p WHERE p.community.id = :communityId AND p.parent IS NULL AND p.isDeleted = false")
    Page<Post> findByCommunityIdAndParentIsNullAndIsDeletedFalse(UUID communityId, Pageable pageable);

    @Query(value = "SELECT p FROM Post p JOIN FETCH p.author LEFT JOIN FETCH p.community " +
           "WHERE p.author.id = :authorId AND p.parent IS NULL AND p.isDeleted = false",
           countQuery = "SELECT COUNT(p) FROM Post p WHERE p.author.id = :authorId AND p.parent IS NULL AND p.isDeleted = false")
    Page<Post> findByAuthorIdAndParentIsNullAndIsDeletedFalse(UUID authorId, Pageable pageable);

    @Query(value = "SELECT p FROM Post p JOIN FETCH p.author LEFT JOIN FETCH p.community " +
           "WHERE p.parent.id = :parentId AND p.isDeleted = false",
           countQuery = "SELECT COUNT(p) FROM Post p WHERE p.parent.id = :parentId AND p.isDeleted = false")
    Page<Post> findByParentIdAndIsDeletedFalse(UUID parentId, Pageable pageable);

    @Query(value = "SELECT p FROM Post p JOIN FETCH p.author LEFT JOIN FETCH p.community " +
           "WHERE p.isDeleted = false AND p.parent IS NULL AND " +
           "(LOWER(p.title) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(p.content) LIKE LOWER(CONCAT('%', :q, '%')))",
           countQuery = "SELECT COUNT(p) FROM Post p WHERE p.isDeleted = false AND p.parent IS NULL AND " +
           "(LOWER(p.title) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(p.content) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Post> search(String q, Pageable pageable);

    // Following feed: posts from users that :userId follows
    @Query(value = "SELECT p FROM Post p JOIN FETCH p.author LEFT JOIN FETCH p.community " +
           "JOIN p.author.followers follower " +
           "WHERE follower.id = :userId AND p.parent IS NULL AND p.isDeleted = false",
           countQuery = "SELECT COUNT(p) FROM Post p JOIN p.author.followers follower " +
           "WHERE follower.id = :userId AND p.parent IS NULL AND p.isDeleted = false")
    Page<Post> findByFollowing(UUID userId, Pageable pageable);

    @Query("SELECT COUNT(p) FROM Post p WHERE p.author.id = :userId AND p.isDeleted = false")
    long countByAuthorId(UUID userId);

    @Query(value = "SELECT p FROM Post p JOIN FETCH p.author LEFT JOIN FETCH p.community JOIN p.savedBy u WHERE u.id = :userId AND p.isDeleted = false",
           countQuery = "SELECT COUNT(p) FROM Post p JOIN p.savedBy u WHERE u.id = :userId AND p.isDeleted = false")
    Page<Post> findSavedByUserId(UUID userId, Pageable pageable);

    long countByIsDeletedFalse();
}
