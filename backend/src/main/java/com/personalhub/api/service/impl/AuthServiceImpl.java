package com.personalhub.api.service.impl;

import com.personalhub.api.dto.AuthUserDto;
import com.personalhub.api.dto.LoginRequest;
import com.personalhub.api.entity.UserAccount;
import com.personalhub.api.repository.UserAccountRepository;
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
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final PasswordEncoder passwordEncoder;
    private final UserAccountRepository userAccountRepository;
    @Value("${app.auth.username}") private String configuredUsername;
    @Value("${app.auth.password-hash}") private String configuredPasswordHash;

    @Override
    public AuthUserDto currentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean authenticated = authentication != null
            && authentication.isAuthenticated()
            && !(authentication.getPrincipal() instanceof String principal
                && "anonymousUser".equals(principal));
        return new AuthUserDto(authenticated ? authentication.getName() : null, authenticated);
    }

    @Override
    public AuthUserDto login(LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        var account = userAccountRepository.findByUsername(request.username());
        boolean validConfiguredAccount = configuredUsername.equals(request.username())
            && !configuredPasswordHash.isBlank()
            && passwordEncoder.matches(request.password(), configuredPasswordHash);
        boolean validDatabaseAccount = account.isPresent()
            && passwordEncoder.matches(request.password(), account.get().getPasswordHash());
        if (!validConfiguredAccount && !validDatabaseAccount) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        }
        String username = account.map(UserAccount::getUsername).orElse(configuredUsername);
        var authentication = new UsernamePasswordAuthenticationToken(
            username, null, java.util.List.of(() -> "ROLE_USER"));
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        // Create a new session (getSession(true) creates one if none exists, avoiding fixation)
        httpRequest.getSession(true).setAttribute(
            HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);
        return new AuthUserDto(username, true);
    }
}
