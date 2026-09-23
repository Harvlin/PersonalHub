package com.personalhub.api.mapper;

import com.personalhub.api.dto.ContactDto;
import com.personalhub.api.dto.CreateContactRequest;
import com.personalhub.api.entity.Contact;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ContactMapper {
    ContactDto toDto(Contact entity);
    Contact toEntity(CreateContactRequest request);
}
