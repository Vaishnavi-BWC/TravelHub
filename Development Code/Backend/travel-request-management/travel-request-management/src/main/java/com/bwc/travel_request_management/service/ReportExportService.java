// ReportExportService.java
package com.bwc.travel_request_management.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.UUID;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import com.bwc.travel_request_management.dto.BudgetVsActualItemDTO;
import com.bwc.travel_request_management.dto.BudgetVsActualReportDTO;
import com.bwc.travel_request_management.dto.ExpenseSummaryReportDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportExportService {

    private final ObjectMapper objectMapper;
    private final FinancialReportService financialReportService;

    public byte[] exportExpenseSummaryToExcel(LocalDate startDate, LocalDate endDate, UUID departmentId) throws IOException {
        ExpenseSummaryReportDTO report = financialReportService.getExpenseSummaryReport(startDate, endDate, departmentId);
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            Sheet sheet = workbook.createSheet("Expense Summary");
            
            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Metric", "Value"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }
            
            // Add data rows
            int rowNum = 1;
            addRow(sheet, rowNum++, "Report Period", report.getReportPeriod());
            addRow(sheet, rowNum++, "Total Travel Requests", report.getTotalTravelRequests().toString());
            addRow(sheet, rowNum++, "Total Estimated Budget", String.format("%.2f", report.getTotalEstimatedBudget()));
            addRow(sheet, rowNum++, "Total Actual Expenses", String.format("%.2f", report.getTotalActualExpenses()));
            addRow(sheet, rowNum++, "Variance", String.format("%.2f", report.getVariance()));
            addRow(sheet, rowNum++, "Average Cost Per Request", String.format("%.2f", report.getAverageCostPerRequest()));
            
            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        }
    }

    public byte[] exportBudgetVsActualToCSV(LocalDate startDate, LocalDate endDate, UUID projectId) throws IOException {
        BudgetVsActualReportDTO report = financialReportService.getBudgetVsActualReport(startDate, endDate, projectId);
        
        CsvMapper csvMapper = new CsvMapper();
        CsvSchema schema = csvMapper.schemaFor(BudgetVsActualItemDTO.class).withHeader();
        
        return csvMapper.writer(schema).writeValueAsBytes(report.getItems());
    }

    public byte[] exportReportToJSON(LocalDate startDate, LocalDate endDate, String reportType) throws IOException {
        Object report = switch (reportType.toLowerCase()) {
            case "expense-summary" -> financialReportService.getExpenseSummaryReport(startDate, endDate, null);
            case "budget-vs-actual" -> financialReportService.getBudgetVsActualReport(startDate, endDate, null);
            case "cost-analysis" -> financialReportService.getCostAnalysisReport(startDate, endDate);
            default -> throw new IllegalArgumentException("Unknown report type: " + reportType);
        };
        
        objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
        return objectMapper.writeValueAsBytes(report);
    }

    private void addRow(Sheet sheet, int rowNum, String metric, String value) {
        Row row = sheet.createRow(rowNum);
        row.createCell(0).setCellValue(metric);
        row.createCell(1).setCellValue(value);
    }
}