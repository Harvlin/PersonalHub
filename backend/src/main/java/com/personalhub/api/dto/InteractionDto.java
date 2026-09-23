package com.personalhub.api.dto;

import java.time.LocalDate;
import java.util.UUID;

public record InteractionDto(UUID id, UUID contactId, LocalDate date, String note) {}
