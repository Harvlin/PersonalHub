package com.personalhub.api.dto;

import com.personalhub.api.enums.Status;
import java.util.UUID;

public record MilestoneDto(UUID id, UUID projectId, String name, Status status) {}
