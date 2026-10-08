package com.personalhub.api.service;

import com.personalhub.api.dto.AuthUserDto;
import com.personalhub.api.dto.LoginRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthService {
    AuthUserDto currentUser();
    AuthUserDto login(LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse);
}
