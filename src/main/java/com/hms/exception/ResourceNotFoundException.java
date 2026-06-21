package com.hms.exception;

/**
 * Throw this from any service method when a Patient, Doctor, Appointment,
 * MedicalRecord, or Invoice lookup by ID fails. The GlobalExceptionHandler
 * turns it into a 404 response automatically.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
