package com.personalhub.api.dto;

import com.personalhub.api.enums.Status;
import com.personalhub.api.enums.ProjectLifecycle;
import com.personalhub.api.enums.ProjectHealth;
import java.time.Instant;
import java.util.UUID;

public record ProjectDto(UUID id, String name, String description, Status status, boolean archived, ProjectLifecycle lifecycle, ProjectHealth health, String blockedReason, Instant blockedSince, Instant createdAt, Instant updatedAt) {}
