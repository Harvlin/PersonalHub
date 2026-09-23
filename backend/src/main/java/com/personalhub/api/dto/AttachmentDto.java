package com.personalhub.api.dto;

import java.time.Instant;
import java.util.UUID;

public record AttachmentDto(UUID id, UUID projectId, String name, String size, Instant uploadedAt) {}
