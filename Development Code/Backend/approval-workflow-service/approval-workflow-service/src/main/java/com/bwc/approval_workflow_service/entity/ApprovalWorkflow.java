package com.bwc.approval_workflow_service.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "approval_workflows")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalWorkflow {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID workflowId;

    @Column(nullable = false)
    private UUID travelRequestId;

    @Column(nullable = false)
    private UUID employeeId;

    @Column(nullable = false)
    private UUID policyId;

    private String employeeName;
    private String employeeEmail;
    private String employeeDepartment;

    @Column(nullable = false)
    @Builder.Default
    private String workflowType = "PRE_TRAVEL";

    @Column(nullable = false)
    @Builder.Default
    private String status = "PENDING";
    
    @Column(name = "current_approver_role", nullable = false)
    private String currentApproverRole;
    
    @Column(name = "current_approver_id")
    private UUID currentApproverId;
    
    @Column(name = "current_step", nullable = false)
    private String currentStep;
    
    @Column(name = "previous_step")
    private String previousStep;

    @Column(name = "next_step")
    private String nextStep;
    
    private LocalDateTime completedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "workflow", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("sequenceOrder ASC")
    @Builder.Default
    private Set<WorkflowStep> steps = new LinkedHashSet<>();

    public void addStep(WorkflowStep step) {
        steps.add(step);
        step.setWorkflow(this);
    }
}