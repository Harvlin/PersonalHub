package com.personalhub.api.mapper;

import com.personalhub.api.dto.SettingsDto;
import com.personalhub.api.entity.UserSetting;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SettingsMapper {
    SettingsDto toDto(UserSetting entity);
}
