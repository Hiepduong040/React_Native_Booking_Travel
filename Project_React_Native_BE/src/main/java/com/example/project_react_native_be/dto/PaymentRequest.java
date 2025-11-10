package com.example.project_react_native_be.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request DTO for payment (fake card)")
public class PaymentRequest {
    @Schema(description = "Booking ID", example = "1", required = true)
    @NotNull(message = "Booking ID is required")
    private Integer bookingId;

    @Schema(description = "Card number (fake)", example = "1234567890123456", required = true)
    @NotBlank(message = "Card number is required")
    private String cardNumber;

    @Schema(description = "Card holder name", example = "John Doe", required = true)
    @NotBlank(message = "Card holder name is required")
    private String cardHolderName;

    @Schema(description = "Expiry date (MM/YY)", example = "12/25", required = true)
    @NotBlank(message = "Expiry date is required")
    private String expiryDate;

    @Schema(description = "CVV", example = "123", required = true)
    @NotBlank(message = "CVV is required")
    private String cvv;

    @Schema(description = "Payment method", example = "CREDIT_CARD")
    private String paymentMethod = "CREDIT_CARD";
}

