package com.example.project_react_native_be.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Generic API response wrapper")
public class ApiResponse {
    @Schema(description = "Response message", example = "Operation successful")
    private String message;
    
    @Schema(description = "Whether the operation was successful", example = "true")
    private boolean success;
    
    @Schema(description = "Response data (can be null)")
    private Object data;
}

