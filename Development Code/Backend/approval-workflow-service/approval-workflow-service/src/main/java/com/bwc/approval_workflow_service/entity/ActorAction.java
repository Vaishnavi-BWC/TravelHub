package com.bwc.approval_workflow_service.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "actor_actions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActorAction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID actionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "step_id", nullable = false)
    private WorkflowStep step;

    @Column(name = "actor_role", nullable = false)
    private String actorRole;

    @Column(name = "actor_id", nullable = false)
    private UUID actorId;

    @Column(name = "actor_name")
    private String actorName;

    @Column(name = "decision", length = 50)
    private String decision;

    @Column(name = "comments", length = 1000)
    private String comments;

    @CreationTimestamp
    private LocalDateTime createdAt;

    private LocalDateTime actionTakenAt;

    @OneToMany(mappedBy = "action", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<StepException> exceptions = new LinkedHashSet<>();

    public void addException(StepException exception) {
        exceptions.add(exception);
        exception.setAction(this);
    }
}