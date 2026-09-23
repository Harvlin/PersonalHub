package com.personalhub.api.entity;

import com.personalhub.api.enums.Status;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tasks")
@Getter @Setter @NoArgsConstructor
public class Task {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @NotBlank @Size(max = 240) @Column(nullable = false, length = 240) private String title;
    @Size(max = 20000) @Column(columnDefinition = "text") private String description;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private Status status = Status.TODO;
    @Size(max = 500) @Column(length = 500) private String blockedReason;
    @NotNull @Column(nullable = false) private UUID projectId;
    @NotNull @Column(nullable = false) private UUID milestoneId;
    private LocalDate due;
    @Column(nullable = false, updatable = false) private Instant createdAt;
    private UUID contactId;

    public Task(String title, String description, UUID projectId, UUID milestoneId, LocalDate due, UUID contactId) {
        this.title = title; this.description = description; this.projectId = projectId; this.milestoneId = milestoneId; this.due = due; this.contactId = contactId;
    }
}
