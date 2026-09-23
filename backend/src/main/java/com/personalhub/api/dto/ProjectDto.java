package com.personalhub.api.dto;

import com.personalhub.api.enums.Status;
import java.time.Instant;
import java.util.UUID;

public record ProjectDto(UUID id, String name, String description, Status status, boolean archived, Instant createdAt, Instant updatedAt) {}
