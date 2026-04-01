package com.ufam.uforum.controller;

import com.ufam.uforum.dto.request.*;
import com.ufam.uforum.dto.response.AuthResponse;
import com.ufam.uforum.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticação")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Cadastrar novo usuário com email @ufam.edu.br e matrícula")
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
        return authService.register(req);
    }

    @PostMapping("/login")
    @Operation(summary = "Login e obtenção de tokens JWT")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Renovar access token usando refresh token")
    public AuthResponse refresh(@Valid @RequestBody RefreshTokenRequest req) {
        return authService.refreshToken(req);
    }
}
