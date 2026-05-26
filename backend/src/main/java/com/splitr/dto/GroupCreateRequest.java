package com.splitr.dto;

import com.splitr.entity.GroupType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record GroupCreateRequest(
    @NotBlank String name,
    String icon,
    @NotNull GroupType type
) {}
