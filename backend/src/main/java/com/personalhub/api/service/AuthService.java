package com.personalhub.api.service;

import com.personalhub.api.dto.AuthUserDto;
import com.personalhub.api.dto.LoginRequest;
import com.personalhub.api.dto.RegisterRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthService {
    AuthUserDto currentUser();
    AuthUserDto login(LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse);
    AuthUserDto register(RegisterRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse);
}
