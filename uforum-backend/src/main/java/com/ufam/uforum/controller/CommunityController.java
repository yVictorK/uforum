package com.ufam.uforum.controller;

import com.ufam.uforum.dto.request.CreateCommunityRequest;
import com.ufam.uforum.dto.request.UpdateCommunityRequest;
import com.ufam.uforum.dto.response.CommunityResponse;
import com.ufam.uforum.dto.response.PostResponse;
import com.ufam.uforum.service.CommunityService;
import com.ufam.uforum.service.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/communities")
@RequiredArgsConstructor
@Tag(name = "Comunidades")
public class CommunityController {

    private final CommunityService communityService;
    private final PostService postService;

    @GetMapping
    @Operation(summary = "Listar todas as comunidades")
    public Page<CommunityResponse> list(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) String q) {
        var pageable = PageRequest.of(page, size, Sort.by("name"));
        return q != null ? communityService.search(q, pageable) : communityService.listAll(pageable);
    }

    @GetMapping("/my")
    @Operation(summary = "Minhas comunidades (que sou membro)")
    public Page<CommunityResponse> getMyCommunities(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int size) {
        return communityService.getMyCommunities(PageRequest.of(page, size, Sort.by("name")));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Detalhes de uma comunidade")
    public CommunityResponse getBySlug(@PathVariable String slug) {
        return communityService.getBySlug(slug);
    }

    @GetMapping("/{slug}/posts")
    @Operation(summary = "Posts de uma comunidade")
    public Page<PostResponse> getPosts(@PathVariable String slug,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "new") String sort) {
        var community = communityService.findBySlugOrThrow(slug);
        var sortBy = sort.equals("top") ? Sort.by("upvotesCount").descending() : Sort.by("createdAt").descending();
        return postService.getPostsByCommunity(community.getId(), PageRequest.of(page, size, sortBy));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Criar nova comunidade")
    public CommunityResponse create(@Valid @RequestBody CreateCommunityRequest req) {
        return communityService.create(req);
    }

    @PatchMapping("/{slug}")
    @Operation(summary = "Editar comunidade (moderadores)")
    public CommunityResponse update(@PathVariable String slug,
        @Valid @RequestBody UpdateCommunityRequest req) {
        return communityService.update(slug, req);
    }

    @DeleteMapping("/{slug}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Excluir comunidade (criador ou admin)")
    public void delete(@PathVariable String slug) {
        communityService.delete(slug);
    }

    @PostMapping("/{slug}/join")
    @Operation(summary = "Entrar em uma comunidade")
    public CommunityResponse join(@PathVariable String slug) {
        return communityService.join(slug);
    }

    @DeleteMapping("/{slug}/leave")
    @Operation(summary = "Sair de uma comunidade")
    public void leave(@PathVariable String slug) {
        communityService.leave(slug);
    }

    @PostMapping("/{slug}/moderators/{userId}")
    @Operation(summary = "Promover membro a moderador")
    public void addModerator(@PathVariable String slug, @PathVariable UUID userId) {
        communityService.addModerator(slug, userId);
    }
}
