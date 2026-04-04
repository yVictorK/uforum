package com.ufam.uforum.dto.response;

public record AdminMetricsResponse(
    long totalUsers,
    long totalPosts,
    long totalEvents
) {}
