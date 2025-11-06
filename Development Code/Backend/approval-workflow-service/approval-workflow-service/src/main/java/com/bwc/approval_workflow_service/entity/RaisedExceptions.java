package com.bwc.approval_workflow_service.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "exceptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RaisedExceptions {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID exceptionId;

    @Column(name = "is_exception", nullable = false)
    @Builder.Default
    private Boolean isException = true;

    @Column(name = "exception_reason", length = 1000)
    private String exceptionReason;

    @CreationTimestamp
    @Column(name = "raised_at", updatable = false)
    private LocalDateTime raisedAt;

    // 👇 Who raised it
    @Column(name = "raised_by_id", columnDefinition = "uuid")
    private UUID raisedById;

    @Column(name = "raised_by_name")
    private String raisedByName;

    @Column(name = "raised_by_role")
    private String raisedByRole;

    // 👇 Link back to the workflow (for quick access)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id", referencedColumnName = "workflowId", nullable = false)
    private ApprovalWorkflow workflow;

    // 👇 Link to the action that caused it
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "action_id", referencedColumnName = "actionId")
    private ApprovalAction action;
}
