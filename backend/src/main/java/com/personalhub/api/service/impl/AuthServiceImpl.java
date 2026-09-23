package com.personalhub.api.service.impl;

import com.personalhub.api.dto.AuthUserDto;
import com.personalhub.api.dto.LoginRequest;
import com.personalhub.api.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final PasswordEncoder passwordEncoder;
    @Value("${app.auth.username}") private String configuredUsername;
    @Value("${app.auth.password-hash}") private String configuredPasswordHash;

    @Override
    public AuthUserDto currentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean authenticated = authentication != null && authentication.isAuthenticated() && !(authentication.getPrincipal() instanceof String principal && "anonymousUser".equals(principal));
        return new AuthUserDto(authenticated ? authentication.getName() : null, authenticated);
    }

    @Override
    public AuthUserDto login(LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        if (configuredPasswordHash.isBlank() || !configuredUsername.equals(request.username()) || !passwordEncoder.matches(request.password(), configuredPasswordHash)) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        }
        var authentication = new UsernamePasswordAuthenticationToken(configuredUsername, null, java.util.List.of(() -> "ROLE_USER"));
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        httpRequest.getSession(true).setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);
        return new AuthUserDto(configuredUsername, true);
    }
}
