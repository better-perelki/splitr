package com.splitr.dto;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(max = 50) String username,
        @Size(max = 20) String phone,
        @Size(min = 3, max = 3) String defaultCurrency,
        @Size(max = 50) String timezone
) {}
