package com.personalhub.api.mapper;

import com.personalhub.api.dto.SettingsDto;
import com.personalhub.api.entity.UserSetting;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-11-01T22:36:52+0700",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.46.200.v20261008-1115, environment: Java 25.0.4.1 (Eclipse Adoptium)"
)
@Component
public class SettingsMapperImpl implements SettingsMapper {

    @Override
    public SettingsDto toDto(UserSetting entity) {
        if ( entity == null ) {
            return null;
        }

        int defaultPingInterval = 0;
        int activeProjectLimit = 0;

        defaultPingInterval = entity.getDefaultPingInterval();
        activeProjectLimit = entity.getActiveProjectLimit();

        SettingsDto settingsDto = new SettingsDto( defaultPingInterval, activeProjectLimit );

        return settingsDto;
    }
}
