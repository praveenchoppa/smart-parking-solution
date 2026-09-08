package com.smartparking.backend.user.dto;

import com.smartparking.backend.user.entity.Role;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateUserRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email address")
    private String email;

    @NotBlank(message = "Phone is required")
    @Pattern(
            regexp = "^\\+?[0-9]{10,15}$",
            message = "Phone must contain 10 to 15 digits and may start with +"
    )
    private String phone;

    @NotNull(message = "Role is required")
    private Role role;
}
