package com.bwc.travel_request_management.mapper;

import com.bwc.travel_request_management.dto.TravelRequestDTO;
import com.bwc.travel_request_management.entity.TravelRequest;
import org.springframework.stereotype.Component;

@Component
public class TravelRequestManualMapper {

    public TravelRequestDTO toDto(TravelRequest entity) {
        if (entity == null) {
            return null;
        }

        return TravelRequestDTO.builder()
                .travelRequestId(entity.getTravelRequestId())
                .employeeId(entity.getEmployeeId())
                .projectId(entity.getProjectId())
                .origin(entity.getOrigin())
                .travelDestination(entity.getTravelDestination())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .purpose(entity.getPurpose())
                .managerPresent(entity.isManagerPresent())
                .estimatedBudget(entity.getEstimatedBudget())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public TravelRequest toEntity(TravelRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        return TravelRequest.builder()
                .travelRequestId(dto.getTravelRequestId())
                .employeeId(dto.getEmployeeId())
                .projectId(dto.getProjectId())
                .origin(dto.getOrigin())
                .travelDestination(dto.getTravelDestination())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .purpose(dto.getPurpose())
                .managerPresent(dto.isManagerPresent())
                .estimatedBudget(dto.getEstimatedBudget())
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .build();
    }
}
