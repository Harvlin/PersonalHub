package com.personalhub.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateAttachmentRequest(@NotBlank @Size(max = 255) String label, @NotBlank @Size(max = 2000) String url) {}
