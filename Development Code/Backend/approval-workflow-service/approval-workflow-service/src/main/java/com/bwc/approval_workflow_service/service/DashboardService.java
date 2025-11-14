package com.bwc.approval_workflow_service.service;

import com.bwc.approval_workflow_service.dto.*;
import com.bwc.approval_workflow_service.entity.ActorAction;
import com.bwc.approval_workflow_service.entity.ApprovalWorkflow;
import com.bwc.approval_workflow_service.entity.StepException;
import com.bwc.approval_workflow_service.entity.WorkflowStep;
import com.bwc.approval_workflow_service.repository.ActorActionRepository;
import com.bwc.approval_workflow_service.repository.ApprovalWorkflowRepository;
import com.bwc.approval_workflow_service.repository.StepExceptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ApprovalWorkflowRepository workflowRepository;
    private final ActorActionRepository actorActionRepository;
    private final StepExceptionRepository stepExceptionRepository;

    @Transactional(readOnly = true)
    public DashboardSummaryDTO getDashboardSummary(UUID userId, String userRole) {
        log.info("Fetching dashboard summary for user: {}, role: {}", userId, userRole);
        
        Long pendingApprovalsCount = getPendingApprovalsCount(userRole);
        Long completedActionsCount = getCompletedActionsCount(userId);
        Long raisedExceptionsCount = getRaisedExceptionsCount(userId);
        Long totalWorkflowsInvolved = getTotalWorkflowsInvolved(userId);
        Long awaitingClarificationCount = getAwaitingClarificationCount(userRole);
        Long returnedRequestsCount = getReturnedRequestsCount(userRole);
        
        return DashboardSummaryDTO.builder()
                .pendingApprovalsCount(pendingApprovalsCount)
                .completedActionsCount(completedActionsCount)
                .raisedExceptionsCount(raisedExceptionsCount)
                .totalWorkflowsInvolved(totalWorkflowsInvolved)
                .awaitingClarificationCount(awaitingClarificationCount)
                .returnedRequestsCount(returnedRequestsCount)
                .build();
    }

    @Transactional(readOnly = true)
    public List<PendingApprovalDTO> getPendingApprovals(String userRole) {
        log.info("Fetching pending approvals for role: {}", userRole);
        
        List<ApprovalWorkflow> pendingWorkflows = workflowRepository.findPendingApprovalsByRole(userRole);
        
        return pendingWorkflows.stream()
                .map(this::mapToPendingApprovalDTO)
                .sorted(Comparator.comparing(PendingApprovalDTO::getSubmittedAt))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ActionHistoryDTO> getActionHistory(UUID userId) {
        log.info("Fetching action history for user: {}", userId);
        
        List<ActorAction> userActions = actorActionRepository.findActionsByActorId(userId);
        
        return userActions.stream()
                .map(this::mapToActionHistoryDTO)
                .sorted(Comparator.comparing(ActionHistoryDTO::getActionTakenAt).reversed())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ActionHistoryDTO> getRoleActionHistory(String userRole) {
        log.info("Fetching action history for role: {}", userRole);
        
        List<ActorAction> roleActions = actorActionRepository.findActionsByRole(userRole);
        
        return roleActions.stream()
                .map(this::mapToActionHistoryDTO)
                .sorted(Comparator.comparing(ActionHistoryDTO::getActionTakenAt).reversed())
                .limit(50) // Limit to recent 50 actions
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExceptionDTO> getRaisedExceptions(UUID userId) {
        log.info("Fetching exceptions raised by user: {}", userId);
        
        List<StepException> userExceptions = stepExceptionRepository.findExceptionsByUserId(userId);
        
        return userExceptions.stream()
                .map(this::mapToExceptionDTO)
                .sorted(Comparator.comparing(ExceptionDTO::getRaisedAt).reversed())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExceptionDTO> getExceptionsByRole(String userRole) {
        log.info("Fetching exceptions for role: {}", userRole);
        
        List<StepException> roleExceptions = stepExceptionRepository.findExceptionsByRole(userRole);
        
        return roleExceptions.stream()
                .map(this::mapToExceptionDTO)
                .sorted(Comparator.comparing(ExceptionDTO::getRaisedAt).reversed())
                .limit(20) // Limit to recent 20 exceptions
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WorkflowDetailDTO getWorkflowDetail(UUID workflowId) {
        log.info("Fetching workflow detail for: {}", workflowId);
        
        ApprovalWorkflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new RuntimeException("Workflow not found: " + workflowId));
        
        List<ActionHistoryDTO> actions = getWorkflowActionHistory(workflowId);
        List<ExceptionDTO> exceptions = getWorkflowExceptions(workflowId);
        List<WorkflowStepDTO> steps = mapWorkflowSteps(workflow);
        
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
                .steps(steps)
                .build();
    }

    @Transactional(readOnly = true)
    public List<ActionHistoryDTO> getWorkflowActionHistory(UUID workflowId) {
        log.info("Fetching action history for workflow: {}", workflowId);
        
        List<ActorAction> workflowActions = actorActionRepository.findActionsByWorkflowId(workflowId);
        
        return workflowActions.stream()
                .map(this::mapToActionHistoryDTO)
                .sorted(Comparator.comparing(ActionHistoryDTO::getActionTakenAt).reversed())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExceptionDTO> getWorkflowExceptions(UUID workflowId) {
        log.info("Fetching exceptions for workflow: {}", workflowId);
        
        List<StepException> workflowExceptions = stepExceptionRepository.findExceptionsByWorkflowId(workflowId);
        
        return workflowExceptions.stream()
                .map(this::mapToExceptionDTO)
                .sorted(Comparator.comparing(ExceptionDTO::getRaisedAt).reversed())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PendingApprovalDTO> getAwaitingClarification(String userRole) {
        log.info("Fetching awaiting clarification requests for role: {}", userRole);
        
        List<ApprovalWorkflow> clarificationWorkflows = workflowRepository.findAwaitingClarificationByRole(userRole);
        
        return clarificationWorkflows.stream()
                .map(this::mapToPendingApprovalDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PendingApprovalDTO> getReturnedRequests(String userRole) {
        log.info("Fetching returned requests for role: {}", userRole);
        
        List<ApprovalWorkflow> returnedWorkflows = workflowRepository.findReturnedRequestsByRole(userRole);
        
        return returnedWorkflows.stream()
                .map(this::mapToPendingApprovalDTO)
                .collect(Collectors.toList());
    }

    // Helper methods for summary counts
    @Transactional(readOnly = true)
    private Long getPendingApprovalsCount(String userRole) {
        return (long) workflowRepository.findPendingApprovalsByRole(userRole).size();
    }

    @Transactional(readOnly = true)
    private Long getCompletedActionsCount(UUID userId) {
        return (long) actorActionRepository.findActionsByActorId(userId).size();
    }

    @Transactional(readOnly = true)
    private Long getRaisedExceptionsCount(UUID userId) {
        return (long) stepExceptionRepository.findExceptionsByUserId(userId).size();
    }

    @Transactional(readOnly = true)
    private Long getAwaitingClarificationCount(String userRole) {
        return (long) workflowRepository.findAwaitingClarificationByRole(userRole).size();
    }

    @Transactional(readOnly = true)
    private Long getReturnedRequestsCount(String userRole) {
        return (long) workflowRepository.findReturnedRequestsByRole(userRole).size();
    }

    @Transactional(readOnly = true)
    private Long getTotalWorkflowsInvolved(UUID userId) {
        List<ApprovalWorkflow> workflowsWithActions = workflowRepository.findWorkflowsWithUserActions(userId);
        List<ApprovalWorkflow> workflowsWithExceptions = workflowRepository.findWorkflowsWithUserExceptions(userId);
        
        // Combine and get unique count
        return workflowsWithActions.stream()
                .map(ApprovalWorkflow::getWorkflowId)
                .distinct()
                .count() + workflowsWithExceptions.stream()
                .map(ApprovalWorkflow::getWorkflowId)
                .distinct()
                .count();
    }

    // Mapping methods - FIXED: Added proper error handling for lazy loading
    private PendingApprovalDTO mapToPendingApprovalDTO(ApprovalWorkflow workflow) {
        return PendingApprovalDTO.builder()
                .workflowId(workflow.getWorkflowId())
                .travelRequestId(workflow.getTravelRequestId())
                .policyId(workflow.getPolicyId())
                .employeeName(workflow.getEmployeeName())
                .employeeDepartment(workflow.getEmployeeDepartment())
                .currentStep(workflow.getCurrentStep())
                .workflowType(workflow.getWorkflowType())
                .submittedAt(workflow.getCreatedAt())
                .pendingDays((int) ChronoUnit.DAYS.between(workflow.getCreatedAt(), LocalDateTime.now()))
                .purpose("Travel Request") // Could be enhanced with actual travel request data
                .travelDestination("Destination") // Could be enhanced with actual travel request data
                .build();
    }

    private ActionHistoryDTO mapToActionHistoryDTO(ActorAction action) {
        try {
            WorkflowStep step = action.getStep();
            ApprovalWorkflow workflow = step.getWorkflow();
            
            return ActionHistoryDTO.builder()
                    .workflowId(workflow.getWorkflowId())
                    .travelRequestId(workflow.getTravelRequestId())
                    .stepName(step.getStepName())
                    .decision(action.getDecision())
                    .comments(action.getComments())
                    .actorName(action.getActorName())
                    .actorRole(action.getActorRole())
                    .actionTakenAt(action.getActionTakenAt())
                    .employeeName(workflow.getEmployeeName())
                    .workflowType(workflow.getWorkflowType())
                    .status(workflow.getStatus())
                    .build();
        } catch (Exception e) {
            log.warn("Error mapping ActorAction to DTO for actionId: {}. Using fallback mapping.", action.getActionId(), e);
            
            // Fallback mapping without lazy-loaded entities
            return ActionHistoryDTO.builder()
                    .workflowId(null) // Can't access without workflow
                    .travelRequestId(null)
                    .stepName("Unknown Step")
                    .decision(action.getDecision())
                    .comments(action.getComments())
                    .actorName(action.getActorName())
                    .actorRole(action.getActorRole())
                    .actionTakenAt(action.getActionTakenAt())
                    .employeeName("Unknown Employee")
                    .workflowType("UNKNOWN")
                    .status("UNKNOWN")
                    .build();
        }
    }

    private ExceptionDTO mapToExceptionDTO(StepException exception) {
        try {
            ActorAction action = exception.getAction();
            WorkflowStep step = action.getStep();
            ApprovalWorkflow workflow = step.getWorkflow();
            
            return ExceptionDTO.builder()
                    .exceptionId(exception.getExceptionId())
                    .workflowId(workflow.getWorkflowId())
                    .travelRequestId(workflow.getTravelRequestId())
                    .stepName(step.getStepName())
                    .reason(exception.getReason())
                    .raisedByName(exception.getRaisedByName())
                    .raisedByRole(exception.getRaisedByRole())
                    .raisedAt(exception.getRaisedAt())
                    .employeeName(workflow.getEmployeeName())
                    .workflowType(workflow.getWorkflowType())
                    .status(workflow.getStatus())
                    .build();
        } catch (Exception e) {
            log.warn("Error mapping StepException to DTO for exceptionId: {}. Using fallback mapping.", exception.getExceptionId(), e);
            
            // Fallback mapping without lazy-loaded entities
            return ExceptionDTO.builder()
                    .exceptionId(exception.getExceptionId())
                    .workflowId(null)
                    .travelRequestId(null)
                    .stepName("Unknown Step")
                    .reason(exception.getReason())
                    .raisedByName(exception.getRaisedByName())
                    .raisedByRole(exception.getRaisedByRole())
                    .raisedAt(exception.getRaisedAt())
                    .employeeName("Unknown Employee")
                    .workflowType("UNKNOWN")
                    .status("UNKNOWN")
                    .build();
        }
    }

    private List<WorkflowStepDTO> mapWorkflowSteps(ApprovalWorkflow workflow) {
        return workflow.getSteps().stream()
                .map(step -> WorkflowStepDTO.builder()
                        .stepName(step.getStepName())
                        .approverRole(step.getApproverRole())
                        .sequenceOrder(step.getSequenceOrder())
                        .status(step.getStatus())
                        .completedAt(step.getCompletedAt())
                        .build())
                .sorted(Comparator.comparing(WorkflowStepDTO::getSequenceOrder))
                .collect(Collectors.toList());
    }
    
    
    @Transactional(readOnly = true)
    public List<WorkflowExceptionSummaryDTO> getPendingWorkflowsWithExceptionsByRole(String role) {
        log.info("Fetching pending workflows with exceptions for role: {}", role);

        List<Object[]> results = workflowRepository.findPendingWorkflowsWithExceptionsByRole(role);

        return results.stream()
                .map(obj -> {
                    ApprovalWorkflow w = (ApprovalWorkflow) obj[0];
                    String reason = (String) obj[1];

                    return WorkflowExceptionSummaryDTO.builder()
                            .workflowId(w.getWorkflowId())
                            .employeeDepartment(w.getEmployeeDepartment())
                            .currentStep(w.getCurrentStep())
                            .currentApproverRole(w.getCurrentApproverRole())
                            .workflowType(w.getWorkflowType())
                            .employeeName(w.getEmployeeName())
                            .status(w.getStatus())
                            .exceptionReasonse(reason)
                            .uri("/api/v1/dashboard/workflows/" + w.getWorkflowId())
                            .build();
                })
                .toList();
    }


}