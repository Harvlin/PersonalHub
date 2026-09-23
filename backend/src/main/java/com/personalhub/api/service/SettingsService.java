package com.personalhub.api.service;

import com.personalhub.api.dto.SettingsDto;
import com.personalhub.api.dto.UpdateSettingsRequest;

public interface SettingsService {
    SettingsDto get();
    SettingsDto update(UpdateSettingsRequest request);
}
