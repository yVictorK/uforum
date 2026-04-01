package com.ufam.uforum.service;

import com.ufam.uforum.dto.request.CreateCommunityRequest;
import com.ufam.uforum.dto.request.UpdateCommunityRequest;
import com.ufam.uforum.dto.response.CommunityResponse;
import com.ufam.uforum.entity.Community;
import com.ufam.uforum.entity.User;
import com.ufam.uforum.exception.BusinessException;
import com.ufam.uforum.exception.ResourceNotFoundException;
import com.ufam.uforum.exception.UnauthorizedException;
import com.ufam.uforum.repository.CommunityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class CommunityService {

    private final CommunityRepository communityRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public Page<CommunityResponse> listAll(Pageable pageable) {
        User current = safeGetCurrentUser();
        return communityRepository.findByIsActiveTrue(pageable)
            .map(c -> toResponse(c, current));
    }

    @Transactional(readOnly = true)
    public Page<CommunityResponse> search(String q, Pageable pageable) {
        User current = safeGetCurrentUser();
        return communityRepository.search(q, pageable).map(c -> toResponse(c, current));
    }

    @Transactional(readOnly = true)
    public CommunityResponse getBySlug(String slug) {
        User current = safeGetCurrentUser();
        Community community = communityRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Comunidade", slug));
        return toResponse(community, current);
    }

    @Transactional
    public CommunityResponse create(CreateCommunityRequest req) {
        User current = userService.getCurrentUser();

        if (communityRepository.existsByName(req.name()))
            throw new BusinessException("Já existe uma comunidade com esse nome");

        String slug = generateSlug(req.name());
        if (communityRepository.existsBySlug(slug))
            slug = slug + "-" + System.currentTimeMillis();

        Community community = Community.builder()
            .name(req.name())
            .slug(slug)
            .description(req.description())
            .bannerUrl(req.bannerUrl())
            .iconUrl(req.iconUrl())
            .isPrivate(req.isPrivate())
            .createdBy(current)
            .build();

        community.getModerators().add(current);
        community.getMembers().add(current);

        return toResponse(communityRepository.save(community), current);
    }

    @Transactional
    public CommunityResponse join(String slug) {
        User current = userService.getCurrentUser();
        Community community = communityRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Comunidade", slug));

        if (community.getIsPrivate())
            throw new BusinessException("Esta comunidade é privada. Solicite um convite.");
        if (community.getMembers().contains(current))
            throw new BusinessException("Você já é membro desta comunidade");

        community.getMembers().add(current);
        return toResponse(communityRepository.save(community), current);
    }

    @Transactional
    public void leave(String slug) {
        User current = userService.getCurrentUser();
        Community community = communityRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Comunidade", slug));

        if (community.getCreatedBy().getId().equals(current.getId()))
            throw new BusinessException("O criador não pode sair da comunidade. Transfira a moderação primeiro.");

        community.getMembers().remove(current);
        community.getModerators().remove(current);
        communityRepository.save(community);
    }

    @Transactional
    public void addModerator(String slug, UUID userId) {
        User current = userService.getCurrentUser();
        Community community = communityRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Comunidade", slug));

        if (!isModerator(community, current))
            throw new UnauthorizedException("Apenas moderadores podem promover outros moderadores");

        User newMod = community.getMembers().stream()
            .filter(m -> m.getId().equals(userId))
            .findFirst()
            .orElseThrow(() -> new BusinessException("Usuário não é membro da comunidade"));

        community.getModerators().add(newMod);
        communityRepository.save(community);
    }


    @Transactional(readOnly = true)
    public Page<CommunityResponse> getMyCommunities(Pageable pageable) {
        User current = userService.getCurrentUser();
        return communityRepository.findByMemberId(current.getId(), pageable)
            .map(c -> toResponse(c, current));
    }

    @Transactional
    public CommunityResponse update(String slug, UpdateCommunityRequest req) {
        User current = userService.getCurrentUser();
        Community community = communityRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Comunidade", slug));

        if (!isModerator(community, current))
            throw new UnauthorizedException("Apenas moderadores podem editar esta comunidade");

        if (req.description() != null) community.setDescription(req.description());
        if (req.bannerUrl() != null) community.setBannerUrl(req.bannerUrl());
        if (req.iconUrl() != null) community.setIconUrl(req.iconUrl());

        return toResponse(communityRepository.save(community), current);
    }

    @Transactional
    public void delete(String slug) {
        User current = userService.getCurrentUser();
        Community community = communityRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Comunidade", slug));

        boolean isCreator = community.getCreatedBy().getId().equals(current.getId());
        boolean isAdmin = current.getRole().name().equals("ADMIN");

        if (!isCreator && !isAdmin)
            throw new UnauthorizedException("Apenas o criador pode excluir esta comunidade");

        community.setIsActive(false);
        communityRepository.save(community);
    }

    public boolean isModerator(Community community, User user) {
        return community.getModerators().stream().anyMatch(m -> m.getId().equals(user.getId()))
            || community.getCreatedBy().getId().equals(user.getId());
    }

    public Community findBySlugOrThrow(String slug) {
        return communityRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Comunidade", slug));
    }

    private String generateSlug(String name) {
        return Normalizer.normalize(name, Normalizer.Form.NFD)
            .replaceAll("[^\\p{ASCII}]", "")
            .toLowerCase()
            .replaceAll("[^a-z0-9\\s-]", "")
            .trim()
            .replaceAll("\\s+", "-");
    }

    private User safeGetCurrentUser() {
        try { return userService.getCurrentUser(); }
        catch (ResourceNotFoundException | org.springframework.security.core.AuthenticationException e) { return null; }
    }

    public CommunityResponse toResponse(Community c, User currentUser) {
        boolean isMember = currentUser != null &&
            c.getMembers().stream().anyMatch(m -> m.getId().equals(currentUser.getId()));
        long memberCount = communityRepository.countMembers(c.getId());

        return new CommunityResponse(
            c.getId(), c.getName(), c.getSlug(), c.getDescription(),
            c.getBannerUrl(), c.getIconUrl(), c.getIsPrivate(),
            memberCount, userService.toSummary(c.getCreatedBy()),
            isMember, c.getCreatedAt()
        );
    }
}
