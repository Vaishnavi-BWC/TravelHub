//package com.bwc.approval_workflow_service.controller;
//
//import com.bwc.approval_workflow_service.dto.WorkflowProgressResponseDTO;
//import com.bwc.approval_workflow_service.service.WorkflowMilestoneService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.UUID;
//
//@RestController
//@RequestMapping("/api/workflows/progress")
//@RequiredArgsConstructor
//public class WorkflowMilestoneController {
//
//    private final WorkflowMilestoneService milestoneService;
//
//    @GetMapping("/{travelRequestId}")
//    public WorkflowProgressResponseDTO getWorkflowProgress(@PathVariable UUID travelRequestId) {
//        return milestoneService.getWorkflowProgress(travelRequestId);
//    }
//}
