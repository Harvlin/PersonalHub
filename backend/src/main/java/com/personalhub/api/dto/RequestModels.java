package com.personalhub.api.dto;

import com.personalhub.api.enums.Status;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public final class RequestModels {
    private RequestModels() {}
    public record ProjectCreate(@NotBlank @Size(max = 160) String name, @Size(max = 10000) String description) {}
    public record ProjectPatch(@Size(max = 160) String name, @Size(max = 10000) String description, Status status, Boolean archived) {}
    public record MilestoneCreate(@NotBlank @Size(max = 160) String name) {}
    public record MilestonePatch(@Size(max = 160) String name, Status status) {}
    public record TaskCreate(@NotBlank @Size(max = 240) String title, @Size(max = 20000) String description, @NotNull UUID projectId, @NotNull UUID milestoneId, LocalDate due, UUID contactId) {}
    public record TaskPatch(@Size(max = 240) String title, @Size(max = 20000) String description, Status status, @Size(max = 500) String blockedReason, UUID projectId, UUID milestoneId, LocalDate due, UUID contactId) {}
    public record ContactCreate(@NotBlank @Size(max = 160) String name, @Size(max = 500) String originContext, List<@Size(max = 80) String> tags, @Min(1) Integer pingIntervalDays) {}
    public record ContactPatch(@Size(max = 160) String name, @Size(max = 500) String originContext, List<@Size(max = 80) String> tags, @Min(1) Integer pingIntervalDays, LocalDate lastContact) {}
    public record InteractionCreate(@NotNull LocalDate date, @NotBlank @Size(max = 10000) String note) {}
    public record ResourceCreate(@NotBlank @Size(max = 120) String label, @NotBlank @Size(max = 2000) String url) {}
    public record AttachmentCreate(@NotBlank @Size(max = 255) String name, @NotBlank @Size(max = 80) String size) {}
    public record SettingsPatch(@Min(1) int defaultPingInterval) {}
}
