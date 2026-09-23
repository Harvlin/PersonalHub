package com.personalhub.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CreateInteractionRequest(@NotNull LocalDate date, @NotBlank @Size(max = 10000) String note) {}
