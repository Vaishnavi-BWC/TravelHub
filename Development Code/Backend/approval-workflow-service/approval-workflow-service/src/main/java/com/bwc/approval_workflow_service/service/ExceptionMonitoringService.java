package com.bwc.approval_workflow_service.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.bwc.approval_workflow_service.dto.ExceptionDashboardDTO;
import com.bwc.approval_workflow_service.dto.ExceptionDTO;
import com.bwc.approval_workflow_service.repository.StepExceptionRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExceptionMonitoringService {

    private final StepExceptionRepository exceptionRepository;

    /**
     * 🎯 Get comprehensive exception dashboard for admins
     */
    public ExceptionDashboardDTO getExceptionDashboard(UUID adminId, String timeRange) {
        LocalDateTime startDate = calculateStartDate(timeRange);
        
        List<Object[]> exceptionStats = exceptionRepository.findExceptionStatsByRoleAndTime(startDate);
        
        return ExceptionDashboardDTO.builder()
                .totalExceptions(exceptionStats.stream().mapToLong(r -> (Long) r[2]).sum())
                .hrExceptions(extractCountByRole(exceptionStats, "HR"))
                .travelDeskExceptions(extractCountByRole(exceptionStats, "TRAVEL_DESK"))
                .recentExceptions(getRecentExceptions(startDate))
                .exceptionTrends(calculateExceptionTrends(startDate))
                .build();
    }

    private long extractCountByRole(List<Object[]> stats, String role) {
        return stats.stream()
                .filter(r -> role.equals(r[0]))
                .mapToLong(r -> (Long) r[2])
                .findFirst()
                .orElse(0L);
    }

    private LocalDateTime calculateStartDate(String timeRange) {
        return switch (timeRange.toUpperCase()) {
            case "WEEK" -> LocalDateTime.now().minusWeeks(1);
            case "MONTH" -> LocalDateTime.now().minusMonths(1);
            case "QUARTER" -> LocalDateTime.now().minusMonths(3);
            default -> LocalDateTime.now().minusDays(1);
        };
    }

    private List<ExceptionDTO> getRecentExceptions(LocalDateTime startDate) {
        // Implementation to get recent exceptions
        return exceptionRepository.findRecentExceptions(startDate).stream()
                .map(exception -> ExceptionDTO.builder()
                        .exceptionId(exception.getExceptionId())
                        .reason(exception.getReason())
                        .raisedByRole(exception.getRaisedByRole())
                        .raisedAt(exception.getRaisedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private Map<String, Long> calculateExceptionTrends(LocalDateTime startDate) {
        // Implementation to calculate exception trends
        return exceptionRepository.findExceptionTrends(startDate).stream()
                .collect(Collectors.toMap(
                        result -> (String) result[0], // date
                        result -> (Long) result[1]    // count
                ));
    }
}