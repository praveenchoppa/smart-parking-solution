package com.smartparking.backend.auth.security;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static AuthUser getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthUser authUser)) {
            throw new AccessDeniedException("Authentication is required");
        }
        return authUser;
    }

    public static Long getCurrentUserId() {
        return getCurrentUser().getId();
    }

    public static boolean isAdmin() {
        return getCurrentUser().getRole() != null
                && "ADMIN".equals(getCurrentUser().getRole().name());
    }

    public static void requireSelfOrAdmin(Long userId) {
        if (isAdmin()) {
            return;
        }
        if (userId == null || !getCurrentUserId().equals(userId)) {
            throw new AccessDeniedException("You are not allowed to access this resource");
        }
    }
}
