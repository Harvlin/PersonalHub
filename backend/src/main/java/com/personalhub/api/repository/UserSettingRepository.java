package com.personalhub.api.repository;

import com.personalhub.api.entity.UserSetting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserSettingRepository extends JpaRepository<UserSetting, String> {
}
