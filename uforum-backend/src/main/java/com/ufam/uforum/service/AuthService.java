package com.ufam.uforum.service;

import com.ufam.uforum.dto.request.ForgotPasswordRequest;
import com.ufam.uforum.dto.request.LoginRequest;
import com.ufam.uforum.dto.request.RefreshTokenRequest;
import com.ufam.uforum.dto.request.RegisterRequest;
import com.ufam.uforum.dto.request.ResetPasswordRequest;
import com.ufam.uforum.dto.response.AuthResponse;
import com.ufam.uforum.dto.response.UserSummaryResponse;
import com.ufam.uforum.entity.PasswordResetToken;
import com.ufam.uforum.entity.User;
import com.ufam.uforum.exception.BusinessException;
import com.ufam.uforum.exception.ResourceNotFoundException;
import com.ufam.uforum.exception.UnauthorizedException;
import com.ufam.uforum.repository.PasswordResetTokenRepository;
import com.ufam.uforum.repository.UserRepository;
import com.ufam.uforum.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final EmailService emailService;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    // FIX: adicionado @Transactional — sem ele o save() não faz commit
    // antes do loadUserByUsername() tentar buscar o usuário, causando 500
    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email()))
            throw new BusinessException("Email já cadastrado");
        if (userRepository.existsByUsername(req.username()))
            throw new BusinessException("Username já em uso");
        if (userRepository.existsByStudentId(req.studentId()))
            throw new BusinessException("Matrícula já cadastrada");

        User user = User.builder()
            .fullName(req.fullName())
            .username(req.username())
            .email(req.email())
            .studentId(req.studentId())
            .password(passwordEncoder.encode(req.password()))
            .course(req.course())
            .semester(req.semester())
            .emailVerified(true)
            .build();

        user = userRepository.saveAndFlush(user); // saveAndFlush garante que o INSERT acontece antes do SELECT

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.email(), req.password())
        );
        User user = userRepository.findByEmail(req.email())
            .orElseThrow(() -> new UnauthorizedException("Credenciais inválidas"));

        if (!user.getIsActive())
            throw new BusinessException("Conta desativada. Entre em contato com o suporte.");

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest req) {
        String email = jwtService.extractUsername(req.refreshToken());
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UnauthorizedException("Token inválido"));

        // Validar que o refresh token apresentado é o mesmo armazenado no banco
        if (user.getRefreshToken() == null || !user.getRefreshToken().equals(req.refreshToken()))
            throw new UnauthorizedException("Refresh token revogado ou inválido");

        // Validar que o refresh token não expirou (check adicional ao JWT)
        if (user.getRefreshTokenExpiry() != null && user.getRefreshTokenExpiry().isBefore(LocalDateTime.now()))
            throw new UnauthorizedException("Refresh token expirado");

        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        if (!jwtService.isTokenValid(req.refreshToken(), userDetails))
            throw new UnauthorizedException("Refresh token expirado ou inválido");

        return buildAuthResponse(user);
    }

    @Transactional
    public void initiatePasswordReset(ForgotPasswordRequest req) {
        User user = userRepository.findByEmail(req.email())
            .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com este email"));

        // Limpar tokens antigos se existirem
        tokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
            .token(token)
            .user(user)
            .expiryDate(LocalDateTime.now().plusMinutes(30))
            .build();

        tokenRepository.save(resetToken);

        String resetLink = frontendUrl + "/auth/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest req) {
        PasswordResetToken resetToken = tokenRepository.findByToken(req.token())
            .orElseThrow(() -> new BusinessException("Token de recuperação inválido ou inexistente"));

        if (resetToken.isExpired()) {
            tokenRepository.delete(resetToken);
            throw new BusinessException("Este link de recuperação expirou. Solicite um novo.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);

        // Token só pode ser usado uma vez
        tokenRepository.delete(resetToken);
    }

    private AuthResponse buildAuthResponse(User user) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        user.setRefreshToken(refreshToken);
        user.setRefreshTokenExpiry(LocalDateTime.now().plusDays(7));
        userRepository.save(user);

        UserSummaryResponse summary = new UserSummaryResponse(
            user.getId(), user.getUsername(), user.getFullName(),
            user.getProfilePictureUrl(), user.getRole().name()
        );
        return new AuthResponse(accessToken, refreshToken, summary);
    }
}
