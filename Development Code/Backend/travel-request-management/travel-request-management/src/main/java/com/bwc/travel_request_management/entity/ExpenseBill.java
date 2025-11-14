package com.bwc.travel_request_management.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "expense_bills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseBill {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID billId;

    @Column(name = "travel_request_id", nullable = false, columnDefinition = "uuid")
    private UUID travelRequestId;

    @Column(name = "employee_id", nullable = false, columnDefinition = "uuid")
    private UUID employeeId;

    @Column(name = "bill_date", nullable = false)
    private LocalDate billDate;

    @Column(name = "expense_category", nullable = false, length = 100)
    private String expenseCategory;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "currency", length = 3)
    @Builder.Default
    private String currency = "INR";

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "original_file_name", nullable = false, length = 255)
    private String originalFileName;

    @Column(name = "file_type", nullable = false, length = 100)
    private String fileType;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @Enumerated(EnumType.STRING)
    @Column(name = "bill_status", nullable = false, length = 20)
    @Builder.Default
    private BillStatus billStatus = BillStatus.PENDING;

    @Column(name = "verification_notes", length = 1000)
    private String verificationNotes;

    @Column(name = "verified_by", columnDefinition = "uuid")
    private UUID verifiedBy;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @CreationTimestamp
    @Column(name = "uploaded_at", updatable = false)
    private LocalDateTime uploadedAt;

    public enum BillStatus {
        PENDING, APPROVED, REJECTED, QUERY_RAISED
    }

    public enum ExpenseCategory {
        ACCOMMODATION, 
        FOOD_MEALS, 
        LOCAL_TRANSPORT, 
        AIR_TRAVEL, 
        TRAIN_TRAVEL, 
        CAR_RENTAL, 
        FUEL, 
        PARKING, 
        TOLL, 
        COMMUNICATION, 
        BUSINESS_MEETING, 
        CONFERENCE_FEES, 
        VISA_FEES, 
        TRAVEL_INSURANCE, 
        MEDICAL, 
        OTHER
    }
}