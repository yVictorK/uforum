package com.ufam.uforum.service;

import com.ufam.uforum.dto.request.UpdateProfileRequest;
import com.ufam.uforum.dto.response.UserProfileResponse;
import com.ufam.uforum.dto.response.UserSummaryResponse;
import com.ufam.uforum.entity.User;
import com.ufam.uforum.exception.BusinessException;
import com.ufam.uforum.exception.ResourceNotFoundException;
import com.ufam.uforum.repository.PostRepository;
import com.ufam.uforum.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final NotificationService notificationService;

    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("Usuário autenticado não encontrado"));
    }

    /**
     * Safely get the current user — returns null if not authenticated or user not found.
     */
    public User safeGetCurrentUser() {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                return null;
            }
            return getCurrentUser();
        } catch (ResourceNotFoundException | org.springframework.security.core.AuthenticationException e) {
            return null;
        }
    }

    public UserProfileResponse getProfile(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("Usuário", username));
        User currentUser = safeGetCurrentUser();
        return toProfileResponse(user, currentUser);
    }

    @Transactional
    public UserProfileResponse updateProfile(UpdateProfileRequest req) {
        User user = getCurrentUser();

        if (req.fullName() != null) user.setFullName(req.fullName());
        if (req.bio() != null) user.setBio(req.bio());
        if (req.course() != null) user.setCourse(req.course());
        if (req.semester() != null) user.setSemester(req.semester());
        if (req.age() != null) user.setAge(req.age());
        if (req.neighborhood() != null) user.setNeighborhood(req.neighborhood());
        if (req.profilePictureUrl() != null) user.setProfilePictureUrl(req.profilePictureUrl());
        if (req.bannerUrl() != null) user.setBannerUrl(req.bannerUrl());
        if (req.whatsappNumber() != null) user.setWhatsappNumber(req.whatsappNumber());
        if (req.currentSubjects() != null) {
            user.getCurrentSubjects().clear();
            user.getCurrentSubjects().addAll(req.currentSubjects());
        }

        return toProfileResponse(userRepository.save(user), user);
    }

    @Transactional
    public void followUser(String username) {
        User current = getCurrentUser();
        User target = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("Usuário", username));

        if (current.getId().equals(target.getId()))
            throw new BusinessException("Você não pode seguir a si mesmo");
        if (current.getFollowing().contains(target))
            throw new BusinessException("Você já segue este usuário");

        current.getFollowing().add(target);
        userRepository.save(current);

        notificationService.notifyNewFollower(target, current);
    }

    @Transactional
    public void unfollowUser(String username) {
        User current = getCurrentUser();
        User target = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("Usuário", username));

        if (!current.getFollowing().contains(target))
            throw new BusinessException("Você não segue este usuário");

        current.getFollowing().remove(target);
        userRepository.save(current);
    }

    public UserSummaryResponse toSummary(User user) {
        User current = safeGetCurrentUser();
        boolean isFollowing = current != null && current.getFollowing().contains(user);
        return new UserSummaryResponse(
            user.getId(), user.getUsername(), user.getFullName(),
            user.getProfilePictureUrl(), user.getRole().name(), isFollowing
        );
    }

    public org.springframework.data.domain.Page<UserSummaryResponse> getFollowers(String username, org.springframework.data.domain.Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", username));
        return userRepository.findFollowers(user.getId(), pageable).map(this::toSummary);
    }

    public org.springframework.data.domain.Page<UserSummaryResponse> getFollowing(String username, org.springframework.data.domain.Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", username));
        return userRepository.findFollowing(user.getId(), pageable).map(this::toSummary);
    }

    private UserProfileResponse toProfileResponse(User user, User currentUser) {
        long postsCount = postRepository.countByAuthorId(user.getId());
        long followersCount = userRepository.countFollowers(user.getId());
        long followingCount = userRepository.countFollowing(user.getId());

        // BUG-03: Calculate isFollowing based on whether the current authenticated user follows this profile
        boolean isFollowing = false;
        if (currentUser != null && !currentUser.getId().equals(user.getId())) {
            isFollowing = currentUser.getFollowing().contains(user);
        }

        return new UserProfileResponse(
            user.getId(), user.getUsername(), user.getFullName(), user.getEmail(),
            user.getBio(), user.getCourse(), user.getSemester(), user.getAge(),
            user.getNeighborhood(), user.getProfilePictureUrl(), user.getBannerUrl(), user.getWhatsappNumber(),
            user.getCurrentSubjects(), followersCount, followingCount,
            postsCount, user.getRole().name(), isFollowing, user.getCreatedAt()
        );
    }
}
