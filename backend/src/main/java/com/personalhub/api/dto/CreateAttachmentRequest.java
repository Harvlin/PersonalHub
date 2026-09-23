package com.personalhub.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateAttachmentRequest(@NotBlank @Size(max = 255) String name, @NotBlank @Size(max = 80) String size) {}
