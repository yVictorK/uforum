package com.ufam.uforum.controller;

import com.ufam.uforum.dto.request.UpdateProfileRequest;
import com.ufam.uforum.dto.response.*;
import com.ufam.uforum.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Usuários")
public class UserController {

    private final UserService userService;
    private final PostService postService;
    private final EventService eventService;
    private final NotificationService notificationService;

    @GetMapping("/{username}")
    @Operation(summary = "Perfil público de um usuário")
    public UserProfileResponse getProfile(@PathVariable String username) {
        return userService.getProfile(username);
    }

    @PatchMapping("/me")
    @Operation(summary = "Atualizar meu perfil")
    public UserProfileResponse updateProfile(@Valid @RequestBody UpdateProfileRequest req) {
        return userService.updateProfile(req);
    }

    @PostMapping("/{username}/follow")
    @Operation(summary = "Seguir um usuário")
    public void follow(@PathVariable String username) {
        userService.followUser(username);
    }

    @DeleteMapping("/{username}/follow")
    @Operation(summary = "Deixar de seguir um usuário")
    public void unfollow(@PathVariable String username) {
        userService.unfollowUser(username);
    }

    @GetMapping("/{username}/posts")
    @Operation(summary = "Posts de um usuário")
    public Page<PostResponse> getUserPosts(@PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return postService.getPostsByUser(username, PageRequest.of(page, size, Sort.by("createdAt").descending()));
    }

    @GetMapping("/me/events")
    @Operation(summary = "Eventos que vou participar")
    public Page<EventResponse> getMyEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return eventService.getMyEvents(PageRequest.of(page, size));
    }

    // FIX: expose saved posts endpoint — frontend /saved page calls this
    @GetMapping("/me/saved")
    @Operation(summary = "Posts salvos pelo usuário autenticado")
    public Page<PostResponse> getSavedPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return postService.getSaved(PageRequest.of(page, size, Sort.by("createdAt").descending()));
    }

    @GetMapping("/me/notifications")
    @Operation(summary = "Minhas notificações")
    public Page<NotificationResponse> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        var current = userService.getCurrentUser();
        return notificationService.getMyNotifications(current.getId(), PageRequest.of(page, size));
    }

    @GetMapping("/me/notifications/unread-count")
    @Operation(summary = "Quantidade de notificações não lidas")
    public long getUnreadCount() {
        return notificationService.countUnread(userService.getCurrentUser().getId());
    }

    @PostMapping("/me/notifications/read-all")
    @Operation(summary = "Marcar todas as notificações como lidas")
    public void markAllRead() {
        notificationService.markAllAsRead(userService.getCurrentUser().getId());
    }
}
