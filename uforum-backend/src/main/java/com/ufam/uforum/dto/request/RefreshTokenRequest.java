package com.ufam.uforum.dto.request;
import jakarta.validation.constraints.NotBlank;
public record RefreshTokenRequest(@NotBlank String refreshToken) {}
