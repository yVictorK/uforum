package com.ufam.uforum.service;

import com.ufam.uforum.dto.request.CreatePostRequest;
import com.ufam.uforum.dto.response.PostResponse;
import com.ufam.uforum.entity.Community;
import com.ufam.uforum.entity.Post;
import com.ufam.uforum.entity.PostVote;
import com.ufam.uforum.entity.User;
import com.ufam.uforum.enums.PostVoteType;
import com.ufam.uforum.exception.BusinessException;
import com.ufam.uforum.exception.ResourceNotFoundException;
import com.ufam.uforum.exception.UnauthorizedException;
import com.ufam.uforum.repository.CommunityRepository;
import com.ufam.uforum.repository.PostRepository;
import com.ufam.uforum.repository.PostVoteRepository;
import com.ufam.uforum.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final PostVoteRepository postVoteRepository;
    private final CommunityRepository communityRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    private static final int MAX_DEPTH = 5;

    public Page<PostResponse> getPostsByCommunity(UUID communityId, Pageable pageable) {
        User current = safeGetCurrentUser();
        return postRepository.findByCommunityIdAndParentIsNullAndIsDeletedFalse(communityId, pageable)
            .map(p -> toResponse(p, current));
    }

    // FIX: was doing postRepository.findAll().stream() to get user — now uses userRepository directly
    public Page<PostResponse> getPostsByUser(String username, Pageable pageable) {
        User target = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("Usuário", username));
        User current = safeGetCurrentUser();
        return postRepository.findByAuthorIdAndParentIsNullAndIsDeletedFalse(target.getId(), pageable)
            .map(p -> toResponse(p, current));
    }

    public Page<PostResponse> getReplies(UUID postId, Pageable pageable) {
        User current = safeGetCurrentUser();
        return postRepository.findByParentIdAndIsDeletedFalse(postId, pageable)
            .map(p -> toResponse(p, current));
    }

    public PostResponse getById(UUID id) {
        User current = safeGetCurrentUser();
        Post post = findOrThrow(id);
        return toResponse(post, current);
    }

    public Page<PostResponse> search(String q, Pageable pageable) {
        User current = safeGetCurrentUser();
        return postRepository.search(q, pageable).map(p -> toResponse(p, current));
    }

    // NEW: endpoint for saved posts
    public Page<PostResponse> getSaved(Pageable pageable) {
        User current = userService.getCurrentUser();
        return postRepository.findSavedByUserId(current.getId(), pageable)
            .map(p -> toResponse(p, current));
    }


    public Page<PostResponse> getFollowingFeed(Pageable pageable) {
        User current = userService.getCurrentUser();
        return postRepository.findByFollowing(current.getId(), pageable)
            .map(p -> toResponse(p, current));
    }

    @Transactional
    public PostResponse create(CreatePostRequest req) {
        User current = userService.getCurrentUser();

        if (req.communityId() == null && req.parentId() == null)
            throw new BusinessException("Post deve pertencer a uma comunidade ou ser resposta a outro post");

        Post parent = null;
        Community community = null;

        if (req.parentId() != null) {
            parent = findOrThrow(req.parentId());
            if (parent.getDepth() >= MAX_DEPTH)
                throw new BusinessException("Limite máximo de aninhamento atingido");
            community = parent.getCommunity();
        }

        if (req.communityId() != null) {
            community = communityRepository.findById(req.communityId())
                .orElseThrow(() -> new ResourceNotFoundException("Comunidade", req.communityId()));
            // Validate the user is a member of the community
            boolean isMember = community.getMembers().stream()
                .anyMatch(m -> m.getId().equals(current.getId()));
            if (!isMember)
                throw new BusinessException("Você precisa ser membro desta comunidade para publicar");
        }

        Post post = Post.builder()
            .title(req.title())
            .content(req.content())
            .imageUrl(req.imageUrl())
            .author(current)
            .community(community)
            .parent(parent)
            .depth(parent != null ? parent.getDepth() + 1 : 0)
            .build();

        post = postRepository.save(post);

        if (parent != null) {
            if (!parent.getAuthor().getId().equals(current.getId())) {
                notificationService.notifyPostReply(parent.getAuthor(), current, post.getId());
            }
            parent.setRepliesCount(parent.getRepliesCount() + 1);
            postRepository.save(parent);
        }

        return toResponse(post, current);
    }

    @Transactional
    public PostResponse vote(UUID postId, String voteTypeStr) {
        User current = userService.getCurrentUser();
        Post post = findOrThrow(postId);
        PostVoteType voteType = PostVoteType.valueOf(voteTypeStr.toUpperCase());

        Optional<PostVote> existingVote = postVoteRepository.findByPostIdAndUserId(postId, current.getId());

        if (existingVote.isPresent()) {
            PostVote vote = existingVote.get();
            if (vote.getVoteType() == voteType) {
                postVoteRepository.delete(vote);
                adjustVoteCount(post, voteType, -1);
            } else {
                adjustVoteCount(post, vote.getVoteType(), -1);
                vote.setVoteType(voteType);
                postVoteRepository.save(vote);
                adjustVoteCount(post, voteType, 1);
            }
        } else {
            PostVote newVote = PostVote.builder()
                .post(post).user(current).voteType(voteType).build();
            postVoteRepository.save(newVote);
            adjustVoteCount(post, voteType, 1);

            if (voteType == PostVoteType.UPVOTE)
                notificationService.notifyPostUpvote(post.getAuthor(), current, post.getId());
        }

        return toResponse(postRepository.save(post), current);
    }

    @Transactional
    public PostResponse toggleSave(UUID postId) {
        User current = userService.getCurrentUser();
        Post post = findOrThrow(postId);

        if (post.getSavedBy().contains(current)) {
            post.getSavedBy().remove(current);
        } else {
            post.getSavedBy().add(current);
        }
        return toResponse(postRepository.save(post), current);
    }

    @Transactional
    public void delete(UUID postId) {
        User current = userService.getCurrentUser();
        Post post = findOrThrow(postId);

        boolean isAuthor = post.getAuthor().getId().equals(current.getId());
        boolean isAdmin = current.getRole().name().equals("ADMIN");
        boolean isMod = post.getCommunity() != null &&
            post.getCommunity().getModerators().stream()
                .anyMatch(m -> m.getId().equals(current.getId()));

        if (!isAuthor && !isAdmin && !isMod)
            throw new UnauthorizedException("Sem permissão para deletar este post");

        post.setIsDeleted(true);
        post.setContent("[post removido]");
        postRepository.save(post);
    }

    private void adjustVoteCount(Post post, PostVoteType type, int delta) {
        if (type == PostVoteType.UPVOTE) post.setUpvotesCount(post.getUpvotesCount() + delta);
        else post.setDownvotesCount(post.getDownvotesCount() + delta);
    }

    private Post findOrThrow(UUID id) {
        return postRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Post", id));
    }

    private User safeGetCurrentUser() {
        try { return userService.getCurrentUser(); }
        catch (ResourceNotFoundException | org.springframework.security.core.AuthenticationException e) { return null; }
    }

    public PostResponse toResponse(Post p, User currentUser) {
        String currentUserVote = null;
        boolean isSaved = false;

        if (currentUser != null) {
            Optional<PostVote> vote = postVoteRepository.findByPostIdAndUserId(p.getId(), currentUser.getId());
            currentUserVote = vote.map(v -> v.getVoteType().name()).orElse(null);
            isSaved = p.getSavedBy().stream().anyMatch(u -> u.getId().equals(currentUser.getId()));
        }

        return new PostResponse(
            p.getId(), p.getTitle(), p.getContent(), p.getImageUrl(),
            userService.toSummary(p.getAuthor()),
            p.getCommunity() != null ? p.getCommunity().getId() : null,
            p.getCommunity() != null ? p.getCommunity().getName() : null,
            p.getCommunity() != null ? p.getCommunity().getSlug() : null,
            p.getParent() != null ? p.getParent().getId() : null,
            p.getDepth(), p.getUpvotesCount(), p.getDownvotesCount(),
            p.getScore(), p.getRepliesCount(), p.getIsDeleted(), p.getIsPinned(),
            currentUserVote, isSaved, p.getCreatedAt(), p.getUpdatedAt()
        );
    }
}
