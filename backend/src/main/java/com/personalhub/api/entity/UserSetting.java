package com.personalhub.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_settings")
@Getter @Setter @NoArgsConstructor
public class UserSetting {
    @Id private String id = "default";
    @Min(1) @Column(nullable = false) private int defaultPingInterval = 21;
}
