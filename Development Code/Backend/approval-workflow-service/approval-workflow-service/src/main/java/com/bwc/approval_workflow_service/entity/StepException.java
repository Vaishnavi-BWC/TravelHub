package com.bwc.approval_workflow_service.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "step_exceptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StepException {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID exceptionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "action_id", nullable = false)
    private ActorAction action;

    @Column(nullable = false, length = 1000)
    private String reason;

    @CreationTimestamp
    private LocalDateTime raisedAt;

    @Column(name = "raised_by_id")
    private UUID raisedById;

    @Column(name = "raised_by_name")
    private String raisedByName;

    @Column(name = "raised_by_role")
    private String raisedByRole;
}