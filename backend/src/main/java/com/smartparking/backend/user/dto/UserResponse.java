package com.smartparking.backend.user.dto;

import com.smartparking.backend.user.entity.Role;
import com.smartparking.backend.user.entity.User;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserResponse {

    private final Long id;
    private final String name;
    private final String email;
    private final String phone;
    private final Role role;

    public static UserResponse fromEntity(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .build();
    }
}
