package com.ufam.uforum.dto.response;
public record AuthResponse(String accessToken, String refreshToken, UserSummaryResponse user) {}
