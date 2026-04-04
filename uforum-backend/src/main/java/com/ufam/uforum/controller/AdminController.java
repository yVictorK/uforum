package com.ufam.uforum.controller;

import com.ufam.uforum.dto.response.AdminMetricsResponse;
import com.ufam.uforum.dto.response.AdminUserResponse;
import com.ufam.uforum.enums.Role;
import com.ufam.uforum.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin")
// Allowed for ADMIN and MODERATOR according to new requirement
@PreAuthorize("hasAnyRole('ADMIN','MODERATOR')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    @Operation(summary = "Listar todos os usuários")
    public Page<AdminUserResponse> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return adminService.getAllUsers(PageRequest.of(page, size, Sort.by("createdAt").descending()));
    }

    @GetMapping("/metrics")
    @Operation(summary = "Obter métricas do sistema")
    public AdminMetricsResponse getMetrics() {
        return adminService.getMetrics();
    }

    @PatchMapping("/users/{id}/role")
    @Operation(summary = "Alterar a função (role) de um usuário")
    public void updateUserRole(@PathVariable UUID id, @RequestParam Role role) {
        adminService.updateUserRole(id, role);
    }

    @PatchMapping("/users/{id}/status")
    @Operation(summary = "Alternar o status de ativo/inativo de um usuário")
    public void toggleUserStatus(@PathVariable UUID id) {
        adminService.toggleUserStatus(id);
    }
}
