package com.personalhub.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "attachments")
@Getter @Setter @NoArgsConstructor
public class Attachment {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @NotNull @Column(nullable = false) private UUID projectId;
    @NotBlank @Size(max = 255) @Column(nullable = false, length = 255) private String label;
    @NotBlank @Size(max = 2000) @Column(nullable = false, length = 2000) private String url;
    @Column(nullable = false, updatable = false) private Instant uploadedAt;

    public Attachment(UUID projectId, String label, String url) { this.projectId = projectId; this.label = label; this.url = url; }
}
