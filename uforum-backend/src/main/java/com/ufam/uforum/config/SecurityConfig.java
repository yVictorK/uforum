package com.ufam.uforum.config;

import com.ufam.uforum.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    // ── Endpoints que NÃO exigem autenticação ──────────────────────────────
    private static final String[] PUBLIC_STATIC = {
        "/",
        "/error",
        "/webjars/**",
        "/swagger-ui.html",
        "/swagger-ui/**",
        "/v3/api-docs",
        "/v3/api-docs/**",
        "/api-docs",
        "/api-docs/**",
        "/actuator/**",
        "/api/v1/auth/**",
        "/api/v1/auth/forgot-password",
        "/api/v1/auth/reset-password"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // ── Swagger, auth, static ──
                .requestMatchers(PUBLIC_STATIC).permitAll()

                // ── Admin ──
                .requestMatchers("/api/v1/admin/**").hasAnyRole("ADMIN", "MODERATOR")

                // ── Users: GET perfil público é permitido, escrita requer auth ──
                .requestMatchers(HttpMethod.GET, "/api/v1/users/{username}").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/users/{username}/posts").permitAll()

                // ── Communities: leitura pública, escrita requer auth ──
                .requestMatchers(HttpMethod.GET, "/api/v1/communities").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/communities/{slug}").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/communities/{slug}/posts").permitAll()

                // ── Posts: leitura pública, escrita requer auth ──
                .requestMatchers(HttpMethod.GET, "/api/v1/posts/{id}").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/posts/{id}/replies").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/posts/search").permitAll()

                // ── Events: leitura pública, criação/exclusão restrita ──
                .requestMatchers(HttpMethod.GET, "/api/v1/events").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/events/{id}").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/events").hasAnyRole("EVENT_MANAGER", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/events/{id}").hasAnyRole("EVENT_MANAGER", "ADMIN")

                // ── Marketplace: leitura pública, escrita requer auth ──
                .requestMatchers(HttpMethod.GET, "/api/v1/marketplace").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/marketplace/{id}").permitAll()

                // ── Map: leitura pública, criação de blocos requer ADMIN ──
                .requestMatchers(HttpMethod.GET, "/api/v1/map/blocks").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/map/blocks/{id}").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/map/blocks").hasRole("ADMIN")

                // ── Tudo o resto requer autenticação ──
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // Restringe CORS ao domínio do frontend em vez de wildcard
        config.setAllowedOriginPatterns(List.of(frontendUrl, "http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
