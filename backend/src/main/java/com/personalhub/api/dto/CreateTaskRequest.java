package com.personalhub.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.UUID;

public record CreateTaskRequest(@NotBlank @Size(max = 240) String title, @Size(max = 20000) String description, @NotNull UUID projectId, @NotNull UUID milestoneId, LocalDate due, UUID contactId) {}
