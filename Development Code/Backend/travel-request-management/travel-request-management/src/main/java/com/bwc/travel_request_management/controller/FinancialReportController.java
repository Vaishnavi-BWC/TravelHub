// FinancialReportController.java
package com.bwc.travel_request_management.controller;

import com.bwc.travel_request_management.dto.*;
import com.bwc.travel_request_management.service.FinancialReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/finance/reports")
@RequiredArgsConstructor
@Tag(name = "Financial Reports", description = "APIs for generating financial reports for finance department")
@PreAuthorize("hasRole('FINANCE') or hasRole('ADMIN')")
public class FinancialReportController {

    private final FinancialReportService financialReportService;

    @Operation(summary = "Get expense summary report")
    @GetMapping("/expense-summary")
    public ResponseEntity<ExpenseSummaryReportDTO> getExpenseSummaryReport(
            @Parameter(description = "Start date (yyyy-MM-dd)") 
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date (yyyy-MM-dd)") 
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @Parameter(description = "Department ID (optional)") 
            @RequestParam(required = false) UUID departmentId) {
        
        log.info("Generating expense summary report from {} to {}, department: {}", startDate, endDate, departmentId);
        return ResponseEntity.ok(financialReportService.getExpenseSummaryReport(startDate, endDate, departmentId));
    }

    @Operation(summary = "Get department expense report")
    @GetMapping("/department-expense")
    public ResponseEntity<DepartmentExpenseReportDTO> getDepartmentExpenseReport(
            @Parameter(description = "Start date (yyyy-MM-dd)") 
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date (yyyy-MM-dd)") 
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        return ResponseEntity.ok(financialReportService.getDepartmentExpenseReport(startDate, endDate));
    }

    @Operation(summary = "Get budget vs actual report")
    @GetMapping("/budget-vs-actual")
    public ResponseEntity<BudgetVsActualReportDTO> getBudgetVsActualReport(
            @Parameter(description = "Start date (yyyy-MM-dd)") 
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date (yyyy-MM-dd)") 
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @Parameter(description = "Project ID (optional)") 
            @RequestParam(required = false) UUID projectId) {
        
        return ResponseEntity.ok(financialReportService.getBudgetVsActualReport(startDate, endDate, projectId));
    }

    @Operation(summary = "Get cost analysis report")
    @GetMapping("/cost-analysis")
    public ResponseEntity<CostAnalysisReportDTO> getCostAnalysisReport(
            @Parameter(description = "Start date (yyyy-MM-dd)") 
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date (yyyy-MM-dd)") 
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        return ResponseEntity.ok(financialReportService.getCostAnalysisReport(startDate, endDate));
    }

    @Operation(summary = "Get tax compliance report")
    @GetMapping("/tax-compliance")
    public ResponseEntity<TaxComplianceReportDTO> getTaxComplianceReport(
            @Parameter(description = "Fiscal year") 
            @RequestParam Integer fiscalYear) {
        
        return ResponseEntity.ok(financialReportService.getTaxComplianceReport(fiscalYear));
    }

    @Operation(summary = "Get cash flow report")
    @GetMapping("/cash-flow")
    public ResponseEntity<CashFlowReportDTO> getCashFlowReport(
            @Parameter(description = "Start date (yyyy-MM-dd)") 
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date (yyyy-MM-dd)") 
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        return ResponseEntity.ok(financialReportService.getCashFlowReport(startDate, endDate));
    }

    @Operation(summary = "Get comprehensive financial dashboard")
    @GetMapping("/dashboard")
    public ResponseEntity<FinancialDashboardDTO> getFinancialDashboard(
            @Parameter(description = "Start date (yyyy-MM-dd)") 
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date (yyyy-MM-dd)") 
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        log.info("Generating financial dashboard from {} to {}", startDate, endDate);
        
        // Generate multiple reports for dashboard
        ExpenseSummaryReportDTO expenseSummary = 
            financialReportService.getExpenseSummaryReport(startDate, endDate, null);
        BudgetVsActualReportDTO budgetVsActual = 
            financialReportService.getBudgetVsActualReport(startDate, endDate, null);
        CostAnalysisReportDTO costAnalysis = 
            financialReportService.getCostAnalysisReport(startDate, endDate);
        
        FinancialDashboardDTO dashboard = FinancialDashboardDTO.builder()
                .expenseSummary(expenseSummary)
                .budgetVsActual(budgetVsActual)
                .costAnalysis(costAnalysis)
                .generatedAt(java.time.LocalDateTime.now())
                .build();
        
        return ResponseEntity.ok(dashboard);
    }
}