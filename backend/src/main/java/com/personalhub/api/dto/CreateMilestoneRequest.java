package com.personalhub.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateMilestoneRequest(@NotBlank @Size(max = 160) String name) {}
