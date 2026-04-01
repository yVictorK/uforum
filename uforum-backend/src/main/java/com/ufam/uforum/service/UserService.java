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

    public UserProfileResponse getProfile(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("Usuário", username));
        return toProfileResponse(user);
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

        return toProfileResponse(userRepository.save(user));
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
        return new UserSummaryResponse(
            user.getId(), user.getUsername(), user.getFullName(),
            user.getProfilePictureUrl(), user.getRole().name()
        );
    }

    private UserProfileResponse toProfileResponse(User user) {
        long postsCount = postRepository.countByAuthorId(user.getId());
        // Usar COUNT queries em vez de carregar todas as entidades na memória
        long followersCount = userRepository.countFollowers(user.getId());
        long followingCount = userRepository.countFollowing(user.getId());
        return new UserProfileResponse(
            user.getId(), user.getUsername(), user.getFullName(), user.getEmail(),
            user.getBio(), user.getCourse(), user.getSemester(), user.getAge(),
            user.getNeighborhood(), user.getProfilePictureUrl(), user.getBannerUrl(), user.getWhatsappNumber(),
            user.getCurrentSubjects(), followersCount, followingCount,
            postsCount, user.getRole().name(), user.getCreatedAt()
        );
    }
}
