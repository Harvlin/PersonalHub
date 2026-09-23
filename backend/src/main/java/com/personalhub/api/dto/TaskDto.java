package com.personalhub.api.dto;

import com.personalhub.api.enums.Status;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record TaskDto(UUID id, String title, String description, Status status, String blockedReason, UUID projectId, UUID milestoneId, LocalDate due, Instant createdAt, UUID contactId) {}
