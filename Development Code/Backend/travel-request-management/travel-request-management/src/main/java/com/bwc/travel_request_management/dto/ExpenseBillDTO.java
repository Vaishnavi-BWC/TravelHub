package com.bwc.travel_request_management.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import com.bwc.travel_request_management.entity.ExpenseBill;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ExpenseBillDTO {

    private UUID billId;
    private UUID travelRequestId;
    private UUID employeeId;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate billDate;

    private String expenseCategory;
    private String description;
    private BigDecimal  amount;
    private String currency;

    private String fileName;
    private String originalFileName;
    private String fileType;
    private Long fileSize;
    private String filePath;

    private ExpenseBill.BillStatus billStatus;
    private String verificationNotes;
    private UUID verifiedBy;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime verifiedAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime uploadedAt;

    // For file download
    private String downloadUrl;
    private String viewUrl;

    // Helper methods
    public boolean isApproved() {
        return ExpenseBill.BillStatus.APPROVED.equals(billStatus);
    }

    public boolean isRejected() {
        return ExpenseBill.BillStatus.REJECTED.equals(billStatus);
    }

    public boolean isPending() {
        return ExpenseBill.BillStatus.PENDING.equals(billStatus);
    }
}