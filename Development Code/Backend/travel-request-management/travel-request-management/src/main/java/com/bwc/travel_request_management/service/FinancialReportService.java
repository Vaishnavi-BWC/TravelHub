// FinancialReportService.java
package com.bwc.travel_request_management.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bwc.travel_request_management.dto.BudgetVsActualItemDTO;
import com.bwc.travel_request_management.dto.BudgetVsActualReportDTO;
import com.bwc.travel_request_management.dto.CashFlowMonthlySummary;
import com.bwc.travel_request_management.dto.CashFlowReportDTO;
import com.bwc.travel_request_management.dto.CostAnalysisReportDTO;
import com.bwc.travel_request_management.dto.DepartmentExpenseReportDTO;
import com.bwc.travel_request_management.dto.DepartmentExpenseSummary;
import com.bwc.travel_request_management.dto.ExpenseSummaryReportDTO;
import com.bwc.travel_request_management.dto.TaxComplianceReportDTO;
import com.bwc.travel_request_management.entity.TravelRequest;
import com.bwc.travel_request_management.repository.TravelBookingRepository;
import com.bwc.travel_request_management.repository.TravelExpenseRepository;
import com.bwc.travel_request_management.repository.TravelRequestRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class FinancialReportService {

    private final TravelRequestRepository travelRequestRepository;
    private final TravelExpenseRepository travelExpenseRepository;
    private final TravelBookingRepository travelBookingRepository;

    // ============ EXPENSE REPORTS ============

    @Transactional(readOnly = true)
    public ExpenseSummaryReportDTO getExpenseSummaryReport(LocalDate startDate, LocalDate endDate, UUID departmentId) {
        log.info("Generating expense summary report from {} to {}", startDate, endDate);
        
        List<TravelRequest> requests = getTravelRequestsInDateRange(startDate, endDate, departmentId);
        
        double totalEstimatedBudget = requests.stream()
                .mapToDouble(req -> req.getEstimatedBudget() != null ? req.getEstimatedBudget() : 0.0)
                .sum();
        
        double totalActualExpenses = getTotalActualExpenses(requests);
        double totalBookingCosts = getTotalBookingCosts(requests);
        
        Map<String, Double> expensesByCategory = getExpensesByCategory(requests);
        Map<String, Double> expensesByProject = getExpensesByProject(requests);
        Map<String, Long> requestCountByStatus = getRequestCountByStatus(requests);
        
        return ExpenseSummaryReportDTO.builder()
                .reportPeriod(startDate + " to " + endDate)
                .totalTravelRequests((long) requests.size())
                .totalEstimatedBudget(totalEstimatedBudget)
                .totalActualExpenses(totalActualExpenses)
                .totalBookingCosts(totalBookingCosts)
                .variance(totalEstimatedBudget - totalActualExpenses)
                .expensesByCategory(expensesByCategory)
                .expensesByProject(expensesByProject)
                .requestCountByStatus(requestCountByStatus)
                .averageCostPerRequest(requests.isEmpty() ? 0 : totalActualExpenses / requests.size())
                .generatedAt(LocalDateTime.now())
                .build();
    }

    @Transactional(readOnly = true)
    public DepartmentExpenseReportDTO getDepartmentExpenseReport(LocalDate startDate, LocalDate endDate) {
        log.info("Generating department expense report from {} to {}", startDate, endDate);
        
        List<TravelRequest> requests = getTravelRequestsInDateRange(startDate, endDate, null);
        
        Map<String, DepartmentExpenseSummary> departmentSummaries = requests.stream()
                .collect(Collectors.groupingBy(
                    req -> "All Departments", // Replace with actual department from employee service
                    Collectors.collectingAndThen(Collectors.toList(), this::createDepartmentSummary)
                ));
        
        return DepartmentExpenseReportDTO.builder()
                .reportPeriod(startDate + " to " + endDate)
                .departmentSummaries(departmentSummaries)
                .totalExpenses(departmentSummaries.values().stream()
                        .mapToDouble(DepartmentExpenseSummary::getTotalActualExpenses)
                        .sum())
                .totalBudget(departmentSummaries.values().stream()
                        .mapToDouble(DepartmentExpenseSummary::getTotalEstimatedBudget)
                        .sum())
                .generatedAt(LocalDateTime.now())
                .build();
    }

    // ============ BUDGET VS ACTUAL REPORTS ============

    @Transactional(readOnly = true)
    public BudgetVsActualReportDTO getBudgetVsActualReport(LocalDate startDate, LocalDate endDate, UUID projectId) {
        log.info("Generating budget vs actual report from {} to {}", startDate, endDate);
        
        List<TravelRequest> requests = getTravelRequestsInDateRange(startDate, endDate, null);
        
        if (projectId != null) {
            requests = requests.stream()
                    .filter(req -> projectId.equals(req.getProjectId()))
                    .collect(Collectors.toList());
        }
        
        List<BudgetVsActualItemDTO> items = requests.stream()
                .map(this::createBudgetVsActualItem)
                .collect(Collectors.toList());
        
        double totalBudget = items.stream().mapToDouble(BudgetVsActualItemDTO::getEstimatedBudget).sum();
        double totalActual = items.stream().mapToDouble(BudgetVsActualItemDTO::getActualExpenses).sum();
        
        return BudgetVsActualReportDTO.builder()
                .reportPeriod(startDate + " to " + endDate)
                .items(items)
                .totalBudget(totalBudget)
                .totalActual(totalActual)
                .variance(totalBudget - totalActual)
                .variancePercentage(totalBudget > 0 ? ((totalBudget - totalActual) / totalBudget) * 100 : 0)
                .generatedAt(LocalDateTime.now())
                .build();
    }

    // ============ COST ANALYSIS REPORTS ============

    @Transactional(readOnly = true)
    public CostAnalysisReportDTO getCostAnalysisReport(LocalDate startDate, LocalDate endDate) {
        log.info("Generating cost analysis report from {} to {}", startDate, endDate);
        
        List<TravelRequest> requests = getTravelRequestsInDateRange(startDate, endDate, null);
        
        Map<String, Double> costByDestination = getCostByDestination(requests);
        Map<String, Double> costByTravelPurpose = getCostByTravelPurpose(requests);
        Map<YearMonth, Double> monthlyTrend = getMonthlyCostTrend(requests);
        Map<String, Double> costByEmployeeLevel = getCostByEmployeeLevel(requests);
        
        return CostAnalysisReportDTO.builder()
                .reportPeriod(startDate + " to " + endDate)
                .costByDestination(costByDestination)
                .costByTravelPurpose(costByTravelPurpose)
                .monthlyCostTrend(monthlyTrend)
                .costByEmployeeLevel(costByEmployeeLevel)
                .averageTripCost(calculateAverageTripCost(requests))
                .mostExpensiveDestination(getMostExpensiveDestination(costByDestination))
                .generatedAt(LocalDateTime.now())
                .build();
    }

    // ============ TAX & COMPLIANCE REPORTS ============

    @Transactional(readOnly = true)
    public TaxComplianceReportDTO getTaxComplianceReport(Integer fiscalYear) {
        log.info("Generating tax compliance report for fiscal year {}", fiscalYear);
        
        LocalDate startDate = LocalDate.of(fiscalYear, 4, 1); // Assuming April start
        LocalDate endDate = LocalDate.of(fiscalYear + 1, 3, 31);
        
        List<TravelRequest> requests = getTravelRequestsInDateRange(startDate, endDate, null);
        
        Map<String, Double> taxableExpenses = getTaxableExpenses(requests);
        Map<String, Double> nonTaxableExpenses = getNonTaxableExpenses(requests);
        Map<String, Integer> employeeWiseExpenses = getEmployeeWiseExpenseCount(requests);
        
        return TaxComplianceReportDTO.builder()
                .fiscalYear(fiscalYear)
                .taxableExpenses(taxableExpenses)
                .nonTaxableExpenses(nonTaxableExpenses)
                .employeeWiseExpenses(employeeWiseExpenses)
                .totalTaxableAmount(taxableExpenses.values().stream().mapToDouble(Double::doubleValue).sum())
                .totalNonTaxableAmount(nonTaxableExpenses.values().stream().mapToDouble(Double::doubleValue).sum())
                .generatedAt(LocalDateTime.now())
                .build();
    }

    // ============ CASH FLOW REPORTS ============

    @Transactional(readOnly = true)
    public CashFlowReportDTO getCashFlowReport(LocalDate startDate, LocalDate endDate) {
        log.info("Generating cash flow report from {} to {}", startDate, endDate);
        
        List<TravelRequest> requests = getTravelRequestsInDateRange(startDate, endDate, null);
        
        Map<YearMonth, CashFlowMonthlySummary> monthlySummaries = requests.stream()
                .collect(Collectors.groupingBy(
                    req -> YearMonth.from(req.getStartDate()),
                    Collectors.collectingAndThen(Collectors.toList(), this::createMonthlySummary)
                ));
        
        return CashFlowReportDTO.builder()
                .reportPeriod(startDate + " to " + endDate)
                .monthlySummaries(monthlySummaries)
                .totalOutflow(monthlySummaries.values().stream()
                        .mapToDouble(CashFlowMonthlySummary::getTotalExpenses)
                        .sum())
                .generatedAt(LocalDateTime.now())
                .build();
    }

    // ============ HELPER METHODS ============

    private List<TravelRequest> getTravelRequestsInDateRange(LocalDate startDate, LocalDate endDate, UUID departmentId) {
        // This would need to be implemented based on your date filtering logic
        // For now, returning all requests - you'll need to implement date filtering
        return travelRequestRepository.findAll();
    }

    private double getTotalActualExpenses(List<TravelRequest> requests) {
        return requests.stream()
                .mapToDouble(req -> req.getExpenses().stream()
                        .mapToDouble(exp -> exp.getItems().stream()
                                .mapToDouble(item -> item.getAmount().doubleValue())
                                .sum())
                        .sum())
                .sum();
    }

    private double getTotalBookingCosts(List<TravelRequest> requests) {
        return requests.stream()
                .mapToDouble(req -> req.getBookings().stream()
                        .mapToDouble(booking -> booking.getBookingAmount() != null ? booking.getBookingAmount() : 0.0)
                        .sum())
                .sum();
    }

    private Map<String, Double> getExpensesByCategory(List<TravelRequest> requests) {
        return requests.stream()
                .flatMap(req -> req.getExpenses().stream())
                .flatMap(exp -> exp.getItems().stream())
                .collect(Collectors.groupingBy(
                    item -> item.getCategory(),
                    Collectors.summingDouble(item -> item.getAmount().doubleValue())
                ));
    }

    private Map<String, Double> getExpensesByProject(List<TravelRequest> requests) {
        return requests.stream()
                .collect(Collectors.groupingBy(
                    req -> req.getProjectId().toString(), // You might want to fetch project names
                    Collectors.summingDouble(req -> getTotalActualExpenses(List.of(req)))
                ));
    }

    private Map<String, Long> getRequestCountByStatus(List<TravelRequest> requests) {
        return requests.stream()
                .collect(Collectors.groupingBy(
                    TravelRequest::getStatus,
                    Collectors.counting()
                ));
    }

    private DepartmentExpenseSummary createDepartmentSummary(List<TravelRequest> requests) {
        double totalBudget = requests.stream()
                .mapToDouble(req -> req.getEstimatedBudget() != null ? req.getEstimatedBudget() : 0.0)
                .sum();
        
        double totalActual = getTotalActualExpenses(requests);
        
        return DepartmentExpenseSummary.builder()
                .totalEstimatedBudget(totalBudget)
                .totalActualExpenses(totalActual)
                .variance(totalBudget - totalActual)
                .requestCount((long) requests.size())
                .averageCostPerRequest(requests.isEmpty() ? 0 : totalActual / requests.size())
                .build();
    }

    private BudgetVsActualItemDTO createBudgetVsActualItem(TravelRequest request) {
        double actualExpenses = getTotalActualExpenses(List.of(request));
        return BudgetVsActualItemDTO.builder()
                .travelRequestId(request.getTravelRequestId())
                .employeeId(request.getEmployeeId())
                .purpose(request.getPurpose())
                .estimatedBudget(request.getEstimatedBudget() != null ? request.getEstimatedBudget() : 0.0)
                .actualExpenses(actualExpenses)
                .variance((request.getEstimatedBudget() != null ? request.getEstimatedBudget() : 0.0) - actualExpenses)
                .status(request.getStatus())
                .build();
    }

    private Map<String, Double> getCostByDestination(List<TravelRequest> requests) {
        return requests.stream()
                .collect(Collectors.groupingBy(
                    TravelRequest::getTravelDestination,
                    Collectors.summingDouble(req -> getTotalActualExpenses(List.of(req)))
                ));
    }

    private Map<String, Double> getCostByTravelPurpose(List<TravelRequest> requests) {
        return requests.stream()
                .collect(Collectors.groupingBy(
                    TravelRequest::getPurpose,
                    Collectors.summingDouble(req -> getTotalActualExpenses(List.of(req)))
                ));
    }

    private Map<YearMonth, Double> getMonthlyCostTrend(List<TravelRequest> requests) {
        return requests.stream()
                .collect(Collectors.groupingBy(
                    req -> YearMonth.from(req.getStartDate()),
                    Collectors.summingDouble(req -> getTotalActualExpenses(List.of(req)))
                ));
    }

    private Map<String, Double> getCostByEmployeeLevel(List<TravelRequest> requests) {
        // This would require integration with employee service to get employee levels
        return new HashMap<>();
    }

    private double calculateAverageTripCost(List<TravelRequest> requests) {
        return requests.isEmpty() ? 0 : 
                getTotalActualExpenses(requests) / requests.size();
    }

    private String getMostExpensiveDestination(Map<String, Double> costByDestination) {
        return costByDestination.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");
    }

    private Map<String, Double> getTaxableExpenses(List<TravelRequest> requests) {
        // Implement logic to identify taxable expenses
        return new HashMap<>();
    }

    private Map<String, Double> getNonTaxableExpenses(List<TravelRequest> requests) {
        // Implement logic to identify non-taxable expenses
        return new HashMap<>();
    }

    private Map<String, Integer> getEmployeeWiseExpenseCount(List<TravelRequest> requests) {
        return requests.stream()
                .collect(Collectors.groupingBy(
                    req -> req.getEmployeeId().toString(),
                    Collectors.summingInt(req -> 1)
                ));
    }

    private CashFlowMonthlySummary createMonthlySummary(List<TravelRequest> requests) {
        double totalExpenses = getTotalActualExpenses(requests);
        double totalBookings = getTotalBookingCosts(requests);
        
        return CashFlowMonthlySummary.builder()
                .totalExpenses(totalExpenses)
                .totalBookings(totalBookings)
                .netCashFlow(-(totalExpenses + totalBookings)) // Negative for outflow
                .requestCount((long) requests.size())
                .build();
    }
}