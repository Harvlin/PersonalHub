package com.personalhub.api.dto;

import jakarta.validation.constraints.Min;

public record UpdateSettingsRequest(@Min(1) int defaultPingInterval) {}
