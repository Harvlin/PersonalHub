package com.personalhub.api.config;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Security configuration for the single-user Personal Hub.
 *
 * Auth model:
 *  - Single user; credentials are set via PERSONAL_HUB_USERNAME and
 *    PERSONAL_HUB_PASSWORD_HASH environment variables.
 *  - Session-based auth with CSRF protection (SameSite cookie).
 *  - Registration endpoint does NOT exist — this is intentional.
 *
 * Single-user data safety:
 *  - ALL data APIs (/api/projects/**, /api/tasks/**, /api/contacts/**, etc.)
 *    require authentication via `.anyRequest().authenticated()`.
 *  - The schema has no user_id columns — there is no multi-tenant concept.
 *    All rows in the database belong implicitly to the one logged-in user.
 *  - An unauthenticated request to any data endpoint returns 401 before any
 *    query executes.  No cross-user data leakage is possible.
 *
 *  Public endpoints (no auth needed):
 *   GET  /api/auth/csrf   — fetch CSRF token for the login form
 *   POST /api/auth/login  — authenticate
 *   GET  /api/auth/me     — check current session (returns unauthenticated=false gracefully)
 *   GET  /actuator/health — health probe (no sensitive data)
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            @Value("${server.servlet.session.cookie.same-site}") String sameSite,
            @Value("${server.servlet.session.cookie.secure}") boolean secureCookies) throws Exception {

        CookieCsrfTokenRepository csrfTokens = CookieCsrfTokenRepository.withHttpOnlyFalse();
        csrfTokens.setCookieCustomizer(cookie -> cookie.sameSite(sameSite).secure(secureCookies).path("/"));
        CsrfTokenRequestAttributeHandler csrfHandler = new CsrfTokenRequestAttributeHandler();
        csrfHandler.setCsrfRequestAttributeName(null);

        return http
            .csrf(csrf -> csrf
                .csrfTokenRepository(csrfTokens)
                .csrfTokenRequestHandler(csrfHandler))
                // No CSRF exclusions — the frontend always fetches the CSRF token
                // via /api/auth/csrf before any mutating request including login.
            .cors(cors -> {})
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .sessionFixation(sessionFixation -> sessionFixation.changeSessionId())
                .maximumSessions(2))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health", "/actuator/health/**").permitAll()
                .requestMatchers("/api/auth/login", "/api/auth/csrf", "/api/auth/me").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .anyRequest().authenticated())
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, exception) ->
                    response.sendError(401, "Authentication required")))
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .invalidateHttpSession(true)
                .deleteCookies("SESSION", "JSESSIONID", "XSRF-TOKEN")
                .logoutSuccessHandler((request, response, authentication) -> response.setStatus(204)))
            .build();
    }

    @Bean
    PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }


    @Bean
    InMemoryUserDetailsManager userDetailsService() { return new InMemoryUserDetailsManager(); }

    @Bean
    CorsConfigurationSource corsConfigurationSource(@Value("${app.cors-origins}") String origins) {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.stream(origins.split(","))
            .map(String::trim).filter(s -> !s.isBlank()).collect(Collectors.toList()));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Content-Type", "X-XSRF-TOKEN"));
        configuration.setExposedHeaders(List.of("Location"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
