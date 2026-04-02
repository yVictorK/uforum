package com.ufam.uforum.controller;

import com.ufam.uforum.dto.request.CreatePostRequest;
import com.ufam.uforum.dto.response.PostResponse;
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
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
@Tag(name = "Posts")
public class PostController {

    private final PostService postService;


    @GetMapping("/feed/following")
    @Operation(summary = "Feed de posts de quem o usuário segue")
    public Page<PostResponse> getFollowingFeed(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size) {
        return postService.getFollowingFeed(PageRequest.of(page, size, Sort.by("createdAt").descending()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar post por ID")
    public PostResponse getById(@PathVariable UUID id) {
        return postService.getById(id);
    }

    @GetMapping("/{id}/replies")
    @Operation(summary = "Respostas de um post")
    public Page<PostResponse> getReplies(@PathVariable UUID id,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size) {
        return postService.getReplies(id, PageRequest.of(page, size, Sort.by("createdAt").ascending()));
    }

    @GetMapping("/search")
    @Operation(summary = "Pesquisar posts")
    public Page<PostResponse> search(@RequestParam String q,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "new") String sort) {
        var sortBy = sort.equals("top") ? Sort.by("upvotesCount").descending() : Sort.by("createdAt").descending();
        return postService.search(q, PageRequest.of(page, size, sortBy));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Criar post ou resposta")
    public PostResponse create(@Valid @RequestBody CreatePostRequest req) {
        return postService.create(req);
    }

    @PostMapping("/{id}/vote")
    @Operation(summary = "Votar em um post (UPVOTE ou DOWNVOTE)")
    public PostResponse vote(@PathVariable UUID id, @RequestParam String type) {
        return postService.vote(id, type);
    }

    @PostMapping("/{id}/save")
    @Operation(summary = "Salvar / desalvar um post")
    public PostResponse toggleSave(@PathVariable UUID id) {
        return postService.toggleSave(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Deletar post")
    public void delete(@PathVariable UUID id) {
        postService.delete(id);
    }
}
