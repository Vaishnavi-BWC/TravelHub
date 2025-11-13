package com.bwc.approval_workflow_service.repository;

import com.bwc.approval_workflow_service.entity.ActorAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ActorActionRepository extends JpaRepository<ActorAction, UUID> {
    
    @Query("SELECT a FROM ActorAction a WHERE a.actorId = :actorId ORDER BY a.actionTakenAt DESC")
    List<ActorAction> findActionsByActorId(@Param("actorId") UUID actorId);
    
    @Query("SELECT a FROM ActorAction a JOIN a.step s JOIN s.workflow w WHERE w.workflowId = :workflowId ORDER BY a.actionTakenAt DESC")
    List<ActorAction> findActionsByWorkflowId(@Param("workflowId") UUID workflowId);
    
    @Query("SELECT a FROM ActorAction a WHERE a.actorRole = :role ORDER BY a.actionTakenAt DESC")
    List<ActorAction> findActionsByRole(@Param("role") String role);
    
    @Query("SELECT COUNT(a) FROM ActorAction a")
    long count();
}