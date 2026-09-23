package com.personalhub.api.dto;

import java.time.Instant;
import java.util.UUID;

public record ResourceDto(UUID id, UUID projectId, String label, String url, Instant addedAt) {}
