package com.personalhub.api.controller;

import com.personalhub.api.dto.AuthUserDto;
import com.personalhub.api.dto.LoginRequest;
import com.personalhub.api.dto.RegisterRequest;
import com.personalhub.api.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @GetMapping("/me")
    public AuthUserDto me() { return authService.currentUser(); }

    @GetMapping("/csrf")
    public ResponseEntity<Void> csrf() { return ResponseEntity.noContent().build(); }

    @PostMapping("/login")
    public AuthUserDto login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        return authService.login(request, httpRequest, httpResponse);
    }

    @PostMapping("/register")
    public AuthUserDto register(@Valid @RequestBody RegisterRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        return authService.register(request, httpRequest, httpResponse);
    }
}
