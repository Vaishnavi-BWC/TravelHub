package com.bwc.travel_request_management.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseBreakdownDTO {
    private BigDecimal accommodationTotal;
    private BigDecimal foodTotal;
    private BigDecimal transportTotal;
    private BigDecimal flightTotal;
    private BigDecimal otherTotal;
}