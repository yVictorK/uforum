package com.ufam.uforum.repository;

import com.ufam.uforum.entity.Community;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CommunityRepository extends JpaRepository<Community, UUID> {
    Optional<Community> findBySlug(String slug);
    boolean existsBySlug(String slug);
    boolean existsByName(String name);

    // JOIN FETCH createdBy evita query extra por item (N+1)
    @Query(value = "SELECT c FROM Community c JOIN FETCH c.createdBy WHERE c.isActive = true",
           countQuery = "SELECT COUNT(c) FROM Community c WHERE c.isActive = true")
    Page<Community> findByIsActiveTrue(Pageable pageable);

    @Query(value = "SELECT c FROM Community c JOIN FETCH c.createdBy WHERE c.isActive = true AND " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :q, '%')))",
           countQuery = "SELECT COUNT(c) FROM Community c WHERE c.isActive = true AND " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Community> search(String q, Pageable pageable);

    @Query(value = "SELECT c FROM Community c JOIN FETCH c.createdBy JOIN c.members m WHERE m.id = :userId AND c.isActive = true",
           countQuery = "SELECT COUNT(c) FROM Community c JOIN c.members m WHERE m.id = :userId AND c.isActive = true")
    Page<Community> findByMemberId(UUID userId, Pageable pageable);

    @Query("SELECT COUNT(m) FROM Community c JOIN c.members m WHERE c.id = :communityId")
    long countMembers(UUID communityId);
}
