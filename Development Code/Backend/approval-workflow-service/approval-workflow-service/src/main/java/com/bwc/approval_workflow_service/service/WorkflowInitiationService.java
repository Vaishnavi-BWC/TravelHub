package com.bwc.approval_workflow_service.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.bwc.approval_workflow_service.client.EmployeeServiceClient;
import com.bwc.approval_workflow_service.client.NotificationServiceClient;
import com.bwc.approval_workflow_service.dto.EmployeeProxyDTO;
import com.bwc.approval_workflow_service.dto.TravelRequestProxyDTO;
import com.bwc.approval_workflow_service.dto.WorkflowInitiationResponseDTO;
import com.bwc.approval_workflow_service.entity.ActorAction;
import com.bwc.approval_workflow_service.entity.ApprovalWorkflow;
import com.bwc.approval_workflow_service.entity.WorkflowConfiguration;
import com.bwc.approval_workflow_service.entity.WorkflowStep;
import com.bwc.approval_workflow_service.exception.WorkflowException;
import com.bwc.approval_workflow_service.repository.ApprovalWorkflowRepository;
import com.bwc.approval_workflow_service.repository.WorkflowConfigurationRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkflowInitiationService {

    private final ApprovalWorkflowRepository workflowRepository;
    private final WorkflowConfigurationRepository configRepository;
    private final NotificationServiceClient notificationService;
    private final EmployeeServiceClient employeeService;

    @Transactional
    public WorkflowInitiationResponseDTO initiateWorkflow(
            TravelRequestProxyDTO travelRequest, String workflowType, Double estimatedCost) {

        UUID travelRequestId = travelRequest.travelRequestId(); // ✅ Record accessor - no "get"

        // ✅ Prevent duplicate workflows
        if (workflowRepository.findByTravelRequestIdAndWorkflowType(travelRequestId, workflowType).isPresent()) {
            throw new WorkflowException("Workflow already exists for travel request " + travelRequestId);
        }

        // ✅ Fetch employee safely
        EmployeeProxyDTO employee = fetchEmployeeSafe(travelRequest.employeeId()); // ✅ Record accessor - no "get"

        // ✅ Load workflow configurations
        List<WorkflowConfiguration> configs = configRepository
                .findByWorkflowTypeAndIsActiveTrueOrderBySequenceOrder(workflowType);

        if (configs.isEmpty()) {
            throw new WorkflowException("No workflow configuration found for type: " + workflowType);
        }

        // ✅ Build base workflow entity
        ApprovalWorkflow workflow = ApprovalWorkflow.builder()
                .travelRequestId(travelRequestId)
                .employeeId(employee.getEmployeeId())
                .policyId(travelRequest.policyId()) // ✅ Record accessor - no "get"
                .employeeName(employee.getFullName())
                .employeeEmail(employee.getEmail())
                .employeeDepartment(employee.getDepartment())
                .workflowType(workflowType)
                .status("IN_PROGRESS")
                .build();

        // ✅ Build workflow steps
        int sequence = 1;
        for (WorkflowConfiguration config : configs) {
            WorkflowStep step = WorkflowStep.builder()
                    .workflow(workflow)
                    .stepName(config.getStepName())
                    .approverRole(config.getApproverRole())
                    .sequenceOrder(sequence)
                    .status(sequence == 1 ? "ACTIVE" : "PENDING")
                    .build();
            workflow.addStep(step);
            sequence++;
        }

        // ✅ Get first step and set as current
        WorkflowStep firstStep = workflow.getSteps().stream()
                .filter(s -> s.getSequenceOrder() == 1)
                .findFirst()
                .orElseThrow(() -> new WorkflowException("No first step found"));

        // ✅ Set required workflow info before save (fix for NOT NULL constraint)
        workflow.setCurrentStep(firstStep.getStepName());
        workflow.setCurrentApproverRole(firstStep.getApproverRole());
        workflow.setCurrentApproverId(null); // can be assigned once approver is known

        // ✅ Add initial system action
        ActorAction systemAction = ActorAction.builder()
                .step(firstStep)
                .actorId(employee.getEmployeeId())
                .actorRole("SYSTEM")
                .actorName(employee.getFullName())
                .decision("SUBMIT")
                .comments("Workflow initiated for travel request")
                .actionTakenAt(LocalDateTime.now())
                .build();

        firstStep.addActorAction(systemAction);

        // ✅ Save workflow
        ApprovalWorkflow saved = workflowRepository.save(workflow);

        log.info("✅ Workflow {} initiated successfully for travel request {}",
                saved.getWorkflowId(), travelRequestId);

        // 🔔 Optional: Send notification (disabled for now)
        /*
        WorkflowNotificationDTO dto = new WorkflowNotificationDTO(
                saved.getWorkflowId(),
                saved.getWorkflowType(),
                firstStep.getStepName(),
                firstStep.getApproverRole(),
                saved.getEmployeeName(),
                saved.getEmployeeEmail(),
                saved.getUpdatedAt()
        );
        notificationService.notifyNextApprover(dto);
        */

        return WorkflowInitiationResponseDTO.builder()
                .workflowId(saved.getWorkflowId())
                .status(saved.getStatus())
                .currentStep(firstStep.getStepName())
                .initiatedAt(saved.getCreatedAt())
                .employeeName(saved.getEmployeeName())
                .build();
    }

    // ✅ Safe fetcher method
    private EmployeeProxyDTO fetchEmployeeSafe(UUID employeeId) {
        try {
            return employeeService.getEmployee(employeeId);
        } catch (Exception e) {
            log.error("❌ Failed to fetch employee {}: {}", employeeId, e.getMessage());
            throw new WorkflowException("Unable to fetch employee details for: " + employeeId);
        }
    }
}