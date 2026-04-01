package com.ufam.uforum.repository;

import com.ufam.uforum.entity.PostVote;
import com.ufam.uforum.enums.PostVoteType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PostVoteRepository extends JpaRepository<PostVote, UUID> {
    Optional<PostVote> findByPostIdAndUserId(UUID postId, UUID userId);
    boolean existsByPostIdAndUserIdAndVoteType(UUID postId, UUID userId, PostVoteType voteType);
}
