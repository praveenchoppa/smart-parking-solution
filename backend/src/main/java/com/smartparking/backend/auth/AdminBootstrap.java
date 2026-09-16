package com.smartparking.backend.auth;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.smartparking.backend.user.entity.Role;
import com.smartparking.backend.user.entity.User;
import com.smartparking.backend.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminBootstrap implements ApplicationRunner {

    private final Environment environment;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        String email = environment.getProperty("app.admin.email", "").trim();
        String password = environment.getProperty("app.admin.password", "").trim();
        String name = environment.getProperty("app.admin.name", "System Admin").trim();
        String phone = environment.getProperty("app.admin.phone", "+919000000000").trim();

        if (email.isEmpty() || password.isEmpty()) {
            log.info("Admin bootstrap skipped. Set ADMIN_EMAIL and ADMIN_PASSWORD to create the first admin.");
            return;
        }

        if (userRepository.existsByEmail(email)) {
            log.info("Admin bootstrap skipped. A user with email '{}' already exists.", email);
            return;
        }

        User admin = User.builder()
                .name(name.isEmpty() ? "System Admin" : name)
                .email(email)
                .phone(phone)
                .role(Role.ADMIN)
                .password(passwordEncoder.encode(password))
                .build();

        userRepository.save(admin);
        log.info("Admin bootstrap created ADMIN account for email '{}'.", email);
    }
}
