package com.bwc.approval_workflow_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TravelDeskStatsDTO {
    private UUID travelDeskId;
    private Long totalActions;
    private Long approvals;
    private Long rejections;
    private Long bookingsCompleted;
    private Long overpricedMarkings;
    private LocalDateTime firstAction;
    private LocalDateTime lastAction;
}