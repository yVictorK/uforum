package com.ufam.uforum.service;

import com.ufam.uforum.dto.response.AdminMetricsResponse;
import com.ufam.uforum.dto.response.AdminUserResponse;
import com.ufam.uforum.entity.User;
import com.ufam.uforum.enums.Role;
import com.ufam.uforum.exception.ResourceNotFoundException;
import com.ufam.uforum.exception.BusinessException;
import com.ufam.uforum.repository.EventRepository;
import com.ufam.uforum.repository.PostRepository;
import com.ufam.uforum.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final EventRepository eventRepository;
    private final UserService userService;

    public Page<AdminUserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toAdminResponse);
    }

    public AdminMetricsResponse getMetrics() {
        return new AdminMetricsResponse(
            userRepository.countByIsActiveTrue(), // Apenas usuários ativos
            postRepository.countByIsDeletedFalse(), // Apenas posts não deletados
            eventRepository.countByIsActiveTrue() // Apenas eventos ativos
        );
    }

    @Transactional
    public void updateUserRole(UUID userId, Role newRole) {
        User targetUser = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        
        User currentUser = userService.getCurrentUser();
        
        // Prevent users from changing their own role maliciously or accidentally via admin panel
        if (targetUser.getId().equals(currentUser.getId())) {
            throw new BusinessException("Você não pode alterar seu próprio cargo.");
        }

        // Estritas validações para Moderadores
        if (currentUser.getRole() == Role.MODERATOR) {
             if (targetUser.getRole() == Role.ADMIN || targetUser.getRole() == Role.MODERATOR) {
                 throw new BusinessException("Moderadores não podem modificar Administradores ou outros Moderadores.");
             }
             if (newRole == Role.ADMIN || newRole == Role.MODERATOR) {
                 throw new BusinessException("Apenas o Administrador pode conceder os cargos de Administrador ou Moderador.");
             }
        }
        
        targetUser.setRole(newRole);
        userRepository.save(targetUser);
    }

    @Transactional
    public void toggleUserStatus(UUID userId) {
        User targetUser = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
            
        User currentUser = userService.getCurrentUser();
        
        if (targetUser.getId().equals(currentUser.getId())) {
            throw new BusinessException("Você não pode alterar seu próprio status.");
        }
        
        // Prevent moderators from banning admins or other moderators
        if (currentUser.getRole() == Role.MODERATOR && (targetUser.getRole() == Role.ADMIN || targetUser.getRole() == Role.MODERATOR)) {
             throw new BusinessException("Você não tem permissão para alterar o status de um Administrador ou de outro Moderador.");
        }

        targetUser.setIsActive(!targetUser.getIsActive());
        userRepository.save(targetUser);
    }

    private AdminUserResponse toAdminResponse(User user) {
        return new AdminUserResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getFullName(),
            user.getRole().name(),
            user.getIsActive(),
            user.getCreatedAt()
        );
    }
}
