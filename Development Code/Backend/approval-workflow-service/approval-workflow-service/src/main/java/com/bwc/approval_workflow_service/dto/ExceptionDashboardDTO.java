package com.bwc.approval_workflow_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExceptionDashboardDTO {
    private Long totalExceptions;
    private Long hrExceptions;
    private Long travelDeskExceptions;
    private List<ExceptionDTO> recentExceptions;
    private Map<String, Long> exceptionTrends;
}