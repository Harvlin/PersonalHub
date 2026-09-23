package com.personalhub.api.service.impl;

import com.personalhub.api.dto.SettingsDto;
import com.personalhub.api.dto.UpdateSettingsRequest;
import com.personalhub.api.entity.UserSetting;
import com.personalhub.api.mapper.SettingsMapper;
import com.personalhub.api.repository.UserSettingRepository;
import com.personalhub.api.service.SettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class SettingsServiceImpl implements SettingsService {
    private final UserSettingRepository settings;
    private final SettingsMapper mapper;
    @Override public SettingsDto get() { return mapper.toDto(settings.findById("default").orElseGet(() -> settings.save(new UserSetting()))); }
    @Override public SettingsDto update(UpdateSettingsRequest request) { UserSetting entity = settings.findById("default").orElseGet(UserSetting::new); entity.setDefaultPingInterval(request.defaultPingInterval()); return mapper.toDto(settings.save(entity)); }
}
