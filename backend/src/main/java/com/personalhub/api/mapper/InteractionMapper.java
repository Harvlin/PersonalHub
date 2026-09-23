package com.personalhub.api.mapper;

import com.personalhub.api.dto.InteractionDto;
import com.personalhub.api.entity.Interaction;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface InteractionMapper {
    InteractionDto toDto(Interaction entity);
}
