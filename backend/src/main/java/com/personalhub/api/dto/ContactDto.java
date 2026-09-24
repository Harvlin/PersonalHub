package com.personalhub.api.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ContactDto(UUID id, String name, String originContext, List<String> tags, int pingIntervalDays, LocalDate lastContact, String notes) {}
