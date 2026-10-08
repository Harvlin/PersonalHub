package com.personalhub.api.controller;

import com.personalhub.api.dto.AuthUserDto;
import com.personalhub.api.dto.LoginRequest;
import com.personalhub.api.dto.CsrfTokenDto;
import com.personalhub.api.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.web.csrf.CsrfToken;

/**
 * Authentication endpoints. Registration is intentionally absent — this is a
 * single-user application. The one user account is created via the
 * PERSONAL_HUB_USERNAME / PERSONAL_HUB_PASSWORD_HASH environment variables.
 * To reset the password, generate a new BCrypt hash and update the env var:
 *   htpasswd -bnBC 12 "" newpassword | tr -d ':\n'
 * then redeploy.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @GetMapping("/me")
    public AuthUserDto me() { return authService.currentUser(); }

    @GetMapping("/csrf")
    public CsrfTokenDto csrf(CsrfToken token) { return new CsrfTokenDto(token.getToken()); }

    @PostMapping("/login")
    public AuthUserDto login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        return authService.login(request, httpRequest, httpResponse);
    }
}
