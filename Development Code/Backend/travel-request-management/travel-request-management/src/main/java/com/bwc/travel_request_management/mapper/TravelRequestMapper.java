package com.bwc.travel_request_management.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.bwc.travel_request_management.dto.ExpenseItemDTO;
import com.bwc.travel_request_management.dto.TravelAttachmentDTO;
import com.bwc.travel_request_management.dto.TravelBookingDTO;
import com.bwc.travel_request_management.dto.TravelExpenseDTO;
import com.bwc.travel_request_management.dto.TravelRequestDTO;
import com.bwc.travel_request_management.entity.ExpenseItem;
import com.bwc.travel_request_management.entity.TravelAttachment;
import com.bwc.travel_request_management.entity.TravelBooking;
import com.bwc.travel_request_management.entity.TravelExpense;
import com.bwc.travel_request_management.entity.TravelRequest;

@Mapper(
    componentModel = "spring",
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
    unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface TravelRequestMapper {

    // TravelRequest mappings
    TravelRequestDTO toDto(TravelRequest entity);
    TravelRequest toEntity(TravelRequestDTO dto);

    // TravelExpense mappings
    TravelExpenseDTO toDto(TravelExpense entity);
    TravelExpense toEntity(TravelExpenseDTO dto);

    // ExpenseItem mappings
    ExpenseItemDTO toDto(ExpenseItem entity);
    ExpenseItem toEntity(ExpenseItemDTO dto);

    // TravelBooking mappings
    TravelBookingDTO toDto(TravelBooking entity);
    TravelBooking toEntity(TravelBookingDTO dto);

    // TravelAttachment mappings
    TravelAttachmentDTO toDto(TravelAttachment entity);
    TravelAttachment toEntity(TravelAttachmentDTO dto);

    // Helper method for BigDecimal conversion (if using BigDecimal)
    default java.math.BigDecimal doubleToBigDecimal(Double value) {
        return value != null ? java.math.BigDecimal.valueOf(value) : null;
    }

    default Double bigDecimalToDouble(java.math.BigDecimal value) {
        return value != null ? value.doubleValue() : null;
    }
}