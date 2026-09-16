package com.smartparking.backend.auth.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.smartparking.backend.auth.dto.LoginRequest;
import com.smartparking.backend.auth.dto.LoginResponse;
import com.smartparking.backend.auth.dto.RegisterRequest;
import com.smartparking.backend.auth.security.JwtUtil;
import com.smartparking.backend.common.exception.DuplicateResourceException;
import com.smartparking.backend.common.exception.UnauthorizedException;
import com.smartparking.backend.user.dto.UserResponse;
import com.smartparking.backend.user.entity.Role;
import com.smartparking.backend.user.entity.User;
import com.smartparking.backend.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String INVALID_CREDENTIALS = "Invalid email or password";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public LoginResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .role(Role.USER)
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        User savedUser = userRepository.save(user);
        return toLoginResponse(savedUser);
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException(INVALID_CREDENTIALS));

        if (user.getPassword() == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException(INVALID_CREDENTIALS);
        }

        return toLoginResponse(user);
    }

    private LoginResponse toLoginResponse(User user) {
        return LoginResponse.builder()
                .token(jwtUtil.generateToken(user))
                .user(UserResponse.fromEntity(user))
                .build();
    }
}
