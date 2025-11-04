// ReportExportController.java
package com.bwc.travel_request_management.controller;

import com.bwc.travel_request_management.service.ReportExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/finance/export")
@RequiredArgsConstructor
@Tag(name = "Report Export", description = "APIs for exporting financial reports")
@PreAuthorize("hasRole('FINANCE') or hasRole('ADMIN')")
public class ReportExportController {

    private final ReportExportService reportExportService;

    @Operation(summary = "Export expense summary to Excel")
    @GetMapping("/expense-summary/excel")
    public ResponseEntity<byte[]> exportExpenseSummaryToExcel(
            @Parameter(description = "Start date (yyyy-MM-dd)") 
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date (yyyy-MM-dd)") 
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @Parameter(description = "Department ID (optional)") 
            @RequestParam(required = false) UUID departmentId) throws IOException {
        
        byte[] excelData = reportExportService.exportExpenseSummaryToExcel(startDate, endDate, departmentId);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                        "attachment; filename=expense-summary-" + LocalDate.now() + ".xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(excelData);
    }

    @Operation(summary = "Export budget vs actual to CSV")
    @GetMapping("/budget-vs-actual/csv")
    public ResponseEntity<byte[]> exportBudgetVsActualToCSV(
            @Parameter(description = "Start date (yyyy-MM-dd)") 
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date (yyyy-MM-dd)") 
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @Parameter(description = "Project ID (optional)") 
            @RequestParam(required = false) UUID projectId) throws IOException {
        
        byte[] csvData = reportExportService.exportBudgetVsActualToCSV(startDate, endDate, projectId);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                        "attachment; filename=budget-vs-actual-" + LocalDate.now() + ".csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvData);
    }

    @Operation(summary = "Export report to JSON")
    @GetMapping("/{reportType}/json")
    public ResponseEntity<byte[]> exportReportToJSON(
            @Parameter(description = "Report type") @PathVariable String reportType,
            @Parameter(description = "Start date (yyyy-MM-dd)") 
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date (yyyy-MM-dd)") 
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) throws IOException {
        
        byte[] jsonData = reportExportService.exportReportToJSON(startDate, endDate, reportType);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                        "attachment; filename=" + reportType + "-" + LocalDate.now() + ".json")
                .contentType(MediaType.APPLICATION_JSON)
                .body(jsonData);
    }
}