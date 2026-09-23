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
@Table(name = "resources")
@Getter @Setter @NoArgsConstructor
public class Resource {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @NotNull @Column(nullable = false) private UUID projectId;
    @NotBlank @Size(max = 120) @Column(nullable = false, length = 120) private String label;
    @NotBlank @Size(max = 2000) @Column(nullable = false, length = 2000) private String url;
    @Column(nullable = false, updatable = false) private Instant addedAt;

    public Resource(UUID projectId, String label, String url) { this.projectId = projectId; this.label = label; this.url = url; }
}
