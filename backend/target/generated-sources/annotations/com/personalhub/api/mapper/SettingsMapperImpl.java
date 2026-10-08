package com.personalhub.api.mapper;

import com.personalhub.api.dto.SettingsDto;
import com.personalhub.api.entity.UserSetting;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-10-08T17:39:46+0700",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.46.100.v20260826-1225, environment: Java 21.0.12.1 (Eclipse Adoptium)"
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
