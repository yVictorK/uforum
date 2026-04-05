package com.ufam.uforum.repository;

import com.ufam.uforum.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    // JOIN FETCH currentSubjects evita LazyInitializationException ao serializar o perfil
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.currentSubjects WHERE u.email = :email")
    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.currentSubjects WHERE u.username = :username")
    Optional<User> findByUsername(String username);

    Optional<User> findByStudentId(String studentId);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByStudentId(String studentId);

    @Query("SELECT COUNT(u) FROM User u JOIN u.following f WHERE u.id = :userId")
    long countFollowing(UUID userId);

    @Query("SELECT COUNT(u) FROM User u JOIN u.followers f WHERE u.id = :userId")
    long countFollowers(UUID userId);

    @Query("SELECT f FROM User u JOIN u.followers f WHERE u.id = :userId")
    org.springframework.data.domain.Page<User> findFollowers(UUID userId, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT f FROM User u JOIN u.following f WHERE u.id = :userId")
    org.springframework.data.domain.Page<User> findFollowing(UUID userId, org.springframework.data.domain.Pageable pageable);

    long countByIsActiveTrue();
}
