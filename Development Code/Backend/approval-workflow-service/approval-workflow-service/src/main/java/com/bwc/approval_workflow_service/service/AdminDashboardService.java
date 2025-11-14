package com.bwc.approval_workflow_service.service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bwc.approval_workflow_service.dto.ActionHistoryDTO;
import com.bwc.approval_workflow_service.dto.AdminDashboardSummaryDTO;
import com.bwc.approval_workflow_service.dto.ExceptionDTO;
import com.bwc.approval_workflow_service.dto.PendingApprovalDTO;
import com.bwc.approval_workflow_service.dto.WorkflowDetailDTO;
import com.bwc.approval_workflow_service.dto.WorkflowStatusCountDTO;
import com.bwc.approval_workflow_service.entity.ActorAction;
import com.bwc.approval_workflow_service.entity.ApprovalWorkflow;
import com.bwc.approval_workflow_service.entity.StepException;
import com.bwc.approval_workflow_service.repository.ActorActionRepository;
import com.bwc.approval_workflow_service.repository.ApprovalWorkflowRepository;
import com.bwc.approval_workflow_service.repository.StepExceptionRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDashboardService {

    private final ApprovalWorkflowRepository workflowRepository;
    private final ActorActionRepository actorActionRepository;
    private final StepExceptionRepository stepExceptionRepository;

    public AdminDashboardSummaryDTO getAdminDashboardSummary() {
        log.info("👑 Generating admin dashboard summary");
        
        List<ApprovalWorkflow> allWorkflows = workflowRepository.findAll();
        
        // Calculate statistics
        long totalWorkflows = allWorkflows.size();
        long pendingWorkflows = allWorkflows.stream()
                .filter(w -> "IN_PROGRESS".equals(w.getStatus()))
                .count();
        long completedWorkflows = allWorkflows.stream()
                .filter(w -> w.getStatus() != null && w.getStatus().contains("COMPLETED"))
                .count();
        long rejectedWorkflows = allWorkflows.stream()
                .filter(w -> w.getStatus() != null && w.getStatus().contains("REJECTED"))
                .count();
        
        // Count pending approvals by role
        Map<String, Long> pendingByRole = allWorkflows.stream()
                .filter(w -> "IN_PROGRESS".equals(w.getStatus()))
                .collect(Collectors.groupingBy(
                    ApprovalWorkflow::getCurrentApproverRole,
                    Collectors.counting()
                ));
        
        // Exception statistics
        List<StepException> allExceptions = stepExceptionRepository.findAll();
        long totalExceptions = allExceptions.size();
//        long openExceptions = allExceptions.stream()
//                .filter(e -> "OPEN".equals(e.getStatus()))
//                .count();
//        
        // Recent activity
        List<ActorAction> recentActions = actorActionRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(ActorAction::getActionTakenAt).reversed())
                .limit(100)
                .collect(Collectors.toList());
        
        return AdminDashboardSummaryDTO.builder()
                .totalWorkflows(totalWorkflows)
                .pendingWorkflows(pendingWorkflows)
                .completedWorkflows(completedWorkflows)
                .rejectedWorkflows(rejectedWorkflows)
                .pendingManagerApprovals(pendingByRole.getOrDefault("MANAGER", 0L))
                .pendingFinanceApprovals(pendingByRole.getOrDefault("FINANCE", 0L))
                .pendingHRApprovals(pendingByRole.getOrDefault("HR", 0L))
                .pendingTravelDeskApprovals(pendingByRole.getOrDefault("TRAVEL_DESK", 0L))
                .totalExceptions(totalExceptions)
//                .openExceptions(openExceptions)
                .recentActivityCount((long) recentActions.size())
                .build();
    }

    public List<WorkflowStatusCountDTO> getWorkflowStatusCountsByRole() {
        List<ApprovalWorkflow> allWorkflows = workflowRepository.findAll();
        
        Map<String, Map<String, Long>> countsByRoleAndStatus = allWorkflows.stream()
                .collect(Collectors.groupingBy(
                    ApprovalWorkflow::getCurrentApproverRole,
                    Collectors.groupingBy(
                        w -> w.getStatus() != null ? w.getStatus() : "UNKNOWN",
                        Collectors.counting()
                    )
                ));
        
        List<WorkflowStatusCountDTO> result = new ArrayList<>();
        countsByRoleAndStatus.forEach((role, statusCounts) -> {
            statusCounts.forEach((status, count) -> {
                result.add(WorkflowStatusCountDTO.builder()
                        .role(role)
                        .status(status)
                        .count(count)
                        .build());
            });
        });
        
        return result;
    }

    public List<PendingApprovalDTO> getAllPendingApprovals() {
        List<ApprovalWorkflow> pendingWorkflows = workflowRepository.findAll().stream()
                .filter(w -> "IN_PROGRESS".equals(w.getStatus()))
                .collect(Collectors.toList());
        
        return convertToPendingApprovalDTOs(pendingWorkflows);
    }

    public List<PendingApprovalDTO> getPendingApprovalsByRole(String role) {
        List<ApprovalWorkflow> pendingWorkflows = workflowRepository.findAll().stream()
                .filter(w -> "IN_PROGRESS".equals(w.getStatus()))
                .filter(w -> role.equalsIgnoreCase(w.getCurrentApproverRole()))
                .collect(Collectors.toList());
        
        return convertToPendingApprovalDTOs(pendingWorkflows);
    }

    public List<ActionHistoryDTO> getAllActionHistory(int limit) {
        return actorActionRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(ActorAction::getActionTakenAt).reversed())
                .limit(limit)
                .map(this::convertToActionHistoryDTO)
                .collect(Collectors.toList());
    }

    public List<ExceptionDTO> getAllExceptions() {
        return stepExceptionRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(StepException::getRaisedAt).reversed())
                .map(this::convertToExceptionDTO)
                .collect(Collectors.toList());
    }

    public List<ExceptionDTO> getExceptionsByRole(String role) {
        return stepExceptionRepository.findExceptionsByRole(role)
                .stream()
                .sorted(Comparator.comparing(StepException::getRaisedAt).reversed())
                .map(this::convertToExceptionDTO)
                .collect(Collectors.toList());
    }

    public List<WorkflowDetailDTO> getAllWorkflows(int page, int size) {
        int start = page * size;
        int end = Math.min(start + size, workflowRepository.findAll().size());
        
        return workflowRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(ApprovalWorkflow::getCreatedAt).reversed())
                .skip(start)
                .limit(size)
                .map(this::convertToWorkflowDetailDTO)
                .collect(Collectors.toList());
    }

    public List<WorkflowDetailDTO> searchWorkflows(String employeeName, String status, 
                                                   String workflowType, String department) {
        return workflowRepository.findAll()
                .stream()
                .filter(w -> employeeName == null || 
                        (w.getEmployeeName() != null && w.getEmployeeName().toLowerCase().contains(employeeName.toLowerCase())))
                .filter(w -> status == null || 
                        (w.getStatus() != null && w.getStatus().equalsIgnoreCase(status)))
                .filter(w -> workflowType == null || 
                        (w.getWorkflowType() != null && w.getWorkflowType().equalsIgnoreCase(workflowType)))
                .filter(w -> department == null || 
                        (w.getEmployeeDepartment() != null && w.getEmployeeDepartment().equalsIgnoreCase(department)))
                .sorted(Comparator.comparing(ApprovalWorkflow::getCreatedAt).reversed())
                .map(this::convertToWorkflowDetailDTO)
                .collect(Collectors.toList());
    }

    public WorkflowDetailDTO getWorkflowDetailAdmin(UUID workflowId) {
        ApprovalWorkflow workflow = workflowRepository.findByIdWithStepsAndActions(workflowId)
                .orElseThrow(() -> new RuntimeException("Workflow not found: " + workflowId));
        
        return convertToWorkflowDetailDTO(workflow);
    }

    public Map<String, Object> getRolePerformanceStatistics() {
        List<ActorAction> allActions = actorActionRepository.findAll();
        List<ApprovalWorkflow> allWorkflows = workflowRepository.findAll();
        
        Map<String, Object> stats = new HashMap<>();
        
        // Calculate average processing time by role
        Map<String, Double> avgProcessingTimeByRole = allWorkflows.stream()
                .filter(w -> w.getCompletedAt() != null && w.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                    w -> w.getCurrentApproverRole() != null ? w.getCurrentApproverRole() : "UNKNOWN",
                    Collectors.averagingLong(w -> 
                        ChronoUnit.MINUTES.between(w.getCreatedAt(), w.getCompletedAt()))
                ));
        
        // Count actions by role
        Map<String, Long> actionCountByRole = allActions.stream()
                .collect(Collectors.groupingBy(
                    ActorAction::getActorRole,
                    Collectors.counting()
                ));
        
        // Approval rate by role
        Map<String, Double> approvalRateByRole = allActions.stream()
                .filter(a -> a.getDecision() != null)
                .collect(Collectors.groupingBy(
                    ActorAction::getActorRole,
                    Collectors.collectingAndThen(
                        Collectors.toList(),
                        list -> {
                            long total = list.size();
                            long approvals = list.stream()
                                    .filter(a -> a.getDecision().contains("APPROVE"))
                                    .count();
                            return total > 0 ? (double) approvals / total * 100 : 0.0;
                        }
                    )
                ));
        
        stats.put("averageProcessingTimeByRole", avgProcessingTimeByRole);
        stats.put("actionCountByRole", actionCountByRole);
        stats.put("approvalRateByRole", approvalRateByRole);
        stats.put("calculatedAt", LocalDateTime.now());
        
        return stats;
    }

    public Map<String, Object> getProcessingTimeStatistics() {
        List<ApprovalWorkflow> allWorkflows = workflowRepository.findAll();
        
        Map<String, Object> stats = new HashMap<>();
        
        // Processing time by workflow type
        Map<String, Double> processingTimeByType = allWorkflows.stream()
                .filter(w -> w.getCompletedAt() != null && w.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                    ApprovalWorkflow::getWorkflowType,
                    Collectors.averagingLong(w -> 
                        ChronoUnit.HOURS.between(w.getCreatedAt(), w.getCompletedAt()))
                ));
        
        stats.put("processingTimeByWorkflowType", processingTimeByType);
        stats.put("totalWorkflowsAnalyzed", allWorkflows.stream()
                .filter(w -> w.getCompletedAt() != null).count());
        stats.put("analysisTimestamp", LocalDateTime.now());
        
        return stats;
    }

    public Map<String, Object> getSystemHealth() {
        Map<String, Object> health = new HashMap<>();
        
        // Database health
        long totalWorkflows = workflowRepository.count();
        long totalActions = actorActionRepository.count();
        long totalExceptions = stepExceptionRepository.count();
        
        health.put("database", Map.of(
            "totalWorkflows", totalWorkflows,
            "totalActions", totalActions,
            "totalExceptions", totalExceptions,
            "status", "HEALTHY"
        ));
        
        // Service health metrics
        List<ApprovalWorkflow> recentWorkflows = workflowRepository.findRecentWorkflows(LocalDateTime.now().minusHours(24));
        long workflowsLast24h = recentWorkflows.size();
        
        health.put("service", Map.of(
            "workflowsLast24h", workflowsLast24h,
            "activeWorkflows", workflowRepository.findAll().stream()
                    .filter(w -> "IN_PROGRESS".equals(w.getStatus()))
                    .count(),
            "uptime", "OPERATIONAL",
            "lastChecked", LocalDateTime.now()
        ));
        
        // Performance metrics
        health.put("performance", Map.of(
            "avgWorkflowCompletionTime", calculateAverageCompletionTime(),
            "exceptionRate", calculateExceptionRate(),
            "pendingWorkflowRatio", calculatePendingRatio()
        ));
        
        return health;
    }

    // Helper methods for DTO conversion
    private List<PendingApprovalDTO> convertToPendingApprovalDTOs(List<ApprovalWorkflow> workflows) {
        return workflows.stream()
                .map(this::convertToPendingApprovalDTO)
                .collect(Collectors.toList());
    }

    private PendingApprovalDTO convertToPendingApprovalDTO(ApprovalWorkflow workflow) {
        return PendingApprovalDTO.builder()
                .workflowId(workflow.getWorkflowId())
                .travelRequestId(workflow.getTravelRequestId())
                .employeeName(workflow.getEmployeeName())
                .employeeDepartment(workflow.getEmployeeDepartment())
                .currentStep(workflow.getCurrentStep())
                .workflowType(workflow.getWorkflowType())
                .submittedAt(workflow.getCreatedAt())
                .pendingDays((int) ChronoUnit.DAYS.between(workflow.getCreatedAt(), LocalDateTime.now()))
                .build();
    }

    private ActionHistoryDTO convertToActionHistoryDTO(ActorAction action) {
        return ActionHistoryDTO.builder()
                .workflowId(action.getStep().getWorkflow().getWorkflowId())
                .status(action.getStep().getWorkflow().getStatus())
                .stepName(action.getStep().getStepName())
                .decision(action.getDecision())
                .comments(action.getComments())
                .actorName(action.getActorName())
                .actorRole(action.getActorRole())
                .actionTakenAt(action.getActionTakenAt())
                .employeeName(action.getStep().getWorkflow().getEmployeeName())
                .workflowType(action.getStep().getWorkflow().getWorkflowType())
                .build();
    }

    private ExceptionDTO convertToExceptionDTO(StepException exception) {
        return ExceptionDTO.builder()
                .exceptionId(exception.getExceptionId())
                .workflowId(exception.getAction().getStep().getWorkflow().getWorkflowId())
                .stepName(exception.getAction().getStep().getStepName())
                .reason(exception.getReason())
                .raisedByName(exception.getRaisedByName())
                .raisedByRole(exception.getRaisedByRole())
                .raisedAt(exception.getRaisedAt())
                .employeeName(exception.getAction().getStep().getWorkflow().getEmployeeName())
                .workflowType(exception.getAction().getStep().getWorkflow().getWorkflowType())
//                .status(exception.getStatus())
                .build();
    }

    private WorkflowDetailDTO convertToWorkflowDetailDTO(ApprovalWorkflow workflow) {
        List<ActionHistoryDTO> actions = workflow.getSteps().stream()
                .flatMap(step -> step.getActorActions().stream())
                .map(this::convertToActionHistoryDTO)
                .sorted(Comparator.comparing(ActionHistoryDTO::getActionTakenAt).reversed())
                .collect(Collectors.toList());

        List<ExceptionDTO> exceptions = workflow.getSteps().stream()
                .flatMap(step -> step.getActorActions().stream())
                .flatMap(action -> action.getExceptions().stream())
                .map(this::convertToExceptionDTO)
                .collect(Collectors.toList());

        return WorkflowDetailDTO.builder()
                .workflowId(workflow.getWorkflowId())
                .travelRequestId(workflow.getTravelRequestId())
                .employeeName(workflow.getEmployeeName())
                .employeeEmail(workflow.getEmployeeEmail())
                .employeeDepartment(workflow.getEmployeeDepartment())
                .workflowType(workflow.getWorkflowType())
                .status(workflow.getStatus())
                .currentStep(workflow.getCurrentStep())
                .currentApproverRole(workflow.getCurrentApproverRole())
                .createdAt(workflow.getCreatedAt())
                .updatedAt(workflow.getUpdatedAt())
                .actions(actions)
                .exceptions(exceptions)
                .steps(workflow.getSteps().stream()
                        .map(step -> com.bwc.approval_workflow_service.dto.WorkflowStepDTO.builder()
                                .stepName(step.getStepName())
                                .approverRole(step.getApproverRole())
                                .sequenceOrder(step.getSequenceOrder())
                                .status(step.getStatus())
                                .completedAt(step.getCompletedAt())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

    private double calculateAverageCompletionTime() {
        List<ApprovalWorkflow> completedWorkflows = workflowRepository.findAll().stream()
                .filter(w -> w.getCompletedAt() != null && w.getCreatedAt() != null)
                .collect(Collectors.toList());
        
        return completedWorkflows.stream()
                .mapToLong(w -> ChronoUnit.HOURS.between(w.getCreatedAt(), w.getCompletedAt()))
                .average()
                .orElse(0.0);
    }

    private double calculateExceptionRate() {
        long totalWorkflows = workflowRepository.count();
        long workflowsWithExceptions = workflowRepository.findAll().stream()
                .filter(w -> w.getSteps().stream()
                        .anyMatch(step -> step.getActorActions().stream()
                                .anyMatch(action -> !action.getExceptions().isEmpty())))
                .count();
        
        return totalWorkflows > 0 ? (double) workflowsWithExceptions / totalWorkflows * 100 : 0.0;
    }

    private double calculatePendingRatio() {
        long totalWorkflows = workflowRepository.count();
        long pendingWorkflows = workflowRepository.findAll().stream()
                .filter(w -> "IN_PROGRESS".equals(w.getStatus()))
                .count();
        
        return totalWorkflows > 0 ? (double) pendingWorkflows / totalWorkflows * 100 : 0.0;
    }
}