package com.ufam.uforum.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * SEC-02: Rate limiting filter for auth endpoints.
 * Uses an in-memory sliding window per IP address.
 * Limits:
 *   - /api/v1/auth/login    → 10 requests / 60s per IP
 *   - /api/v1/auth/register → 5 requests / 60s per IP
 *   - /api/v1/auth/refresh  → 20 requests / 60s per IP
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@Slf4j
public class RateLimitFilter implements Filter {

    private static final Map<String, RateBucket> BUCKETS = new ConcurrentHashMap<>();

    // Clean expired entries every 5 minutes (lazy cleanup on each request + periodic via count)
    private static final long CLEANUP_INTERVAL_MS = 300_000;
    private volatile long lastCleanup = System.currentTimeMillis();

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        String path = request.getRequestURI();
        int limit = getRateLimit(path);

        // Only rate-limit auth endpoints
        if (limit <= 0) {
            chain.doFilter(req, res);
            return;
        }

        String clientIp = getClientIp(request);
        String key = clientIp + ":" + path;

        // Lazy cleanup
        long now = System.currentTimeMillis();
        if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
            lastCleanup = now;
            BUCKETS.entrySet().removeIf(e -> e.getValue().isExpired(now));
        }

        RateBucket bucket = BUCKETS.computeIfAbsent(key, k -> new RateBucket(now));

        // If window expired, reset
        if (bucket.isExpired(now)) {
            bucket.reset(now);
        }

        int current = bucket.incrementAndGet();

        // Add rate limit headers
        response.setHeader("X-RateLimit-Limit", String.valueOf(limit));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(Math.max(0, limit - current)));
        response.setHeader("X-RateLimit-Reset", String.valueOf((bucket.windowStart + 60_000 - now) / 1000));

        if (current > limit) {
            log.warn("Rate limit exceeded for IP {} on {}", clientIp, path);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write(
                "{\"timestamp\":\"" + java.time.LocalDateTime.now() + "\","
                + "\"status\":429,"
                + "\"message\":\"Muitas requisições. Tente novamente em alguns segundos.\","
                + "\"path\":\"" + path + "\"}"
            );
            return;
        }

        chain.doFilter(req, res);
    }

    /**
     * Returns the rate limit for a given path, or -1 if no limit applies.
     */
    private int getRateLimit(String path) {
        if (path.equals("/api/v1/auth/login")) return 10;
        if (path.equals("/api/v1/auth/register")) return 5;
        if (path.equals("/api/v1/auth/refresh")) return 20;
        return -1; // no rate limit
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    /**
     * Simple rate bucket: counts requests in a 60-second sliding window.
     */
    private static class RateBucket {
        volatile long windowStart;
        final AtomicInteger count = new AtomicInteger(0);

        RateBucket(long windowStart) {
            this.windowStart = windowStart;
        }

        boolean isExpired(long now) {
            return now - windowStart > 60_000;
        }

        void reset(long now) {
            this.windowStart = now;
            this.count.set(0);
        }

        int incrementAndGet() {
            return count.incrementAndGet();
        }
    }
}
