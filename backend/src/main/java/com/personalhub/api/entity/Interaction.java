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
import java.time.LocalDate;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "interactions")
@Getter @Setter @NoArgsConstructor
public class Interaction {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @NotNull @Column(nullable = false) private UUID contactId;
    @NotNull @Column(nullable = false) private LocalDate date;
    @NotBlank @Size(max = 10000) @Column(nullable = false, columnDefinition = "text") private String note;

    public Interaction(UUID contactId, LocalDate date, String note) { this.contactId = contactId; this.date = date; this.note = note; }
}
