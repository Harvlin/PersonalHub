package com.personalhub.api.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "contacts")
@Getter @Setter @NoArgsConstructor
public class Contact {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @NotBlank @Size(max = 160) @Column(nullable = false, length = 160) private String name;
    @Size(max = 500) @Column(length = 500) private String originContext;
    @ElementCollection @CollectionTable(name = "contact_tags", joinColumns = @JoinColumn(name = "contact_id"))
    @Column(name = "tag", nullable = false, length = 80) private List<String> tags = new ArrayList<>();
    @Min(1) @Column(nullable = false) private int pingIntervalDays = 21;
    private LocalDate lastContact;
    @Size(max = 20000) @Column(columnDefinition = "text") private String notes;

    public Contact(String name, String originContext, List<String> tags, int pingIntervalDays) {
        this.name = name; this.originContext = originContext; this.tags = tags == null ? new ArrayList<>() : new ArrayList<>(tags); this.pingIntervalDays = pingIntervalDays;
    }
}
