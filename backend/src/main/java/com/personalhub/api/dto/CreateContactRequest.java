package com.personalhub.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CreateContactRequest(@NotBlank @Size(max = 160) String name, @Size(max = 500) String originContext, List<@Size(max = 80) String> tags, @Min(1) Integer pingIntervalDays) {}
