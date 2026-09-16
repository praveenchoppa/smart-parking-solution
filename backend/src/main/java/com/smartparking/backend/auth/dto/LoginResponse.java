package com.smartparking.backend.auth.dto;

import com.smartparking.backend.user.dto.UserResponse;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {

    private final String token;
    private final UserResponse user;
}
