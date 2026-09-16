package com.smartparking.backend.auth.security;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import com.smartparking.backend.user.entity.Role;
import com.smartparking.backend.user.entity.User;

import java.util.Collection;
import java.util.List;

@Getter
public class AuthUser {

    private final Long id;
    private final String email;
    private final Role role;

    public AuthUser(Long id, String email, Role role) {
        this.id = id;
        this.email = email;
        this.role = role;
    }

    public static AuthUser from(User user) {
        return new AuthUser(user.getId(), user.getEmail(), user.getRole());
    }

    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }
}
