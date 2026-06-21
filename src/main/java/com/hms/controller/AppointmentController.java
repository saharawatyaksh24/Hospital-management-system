package com.hms.controller;

import com.hms.dto.ApiResponse;
import com.hms.entity.Appointment;
import com.hms.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<Appointment>> create(@Valid @RequestBody Appointment appointment) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Appointment scheduled", appointmentService.create(appointment)));
    }

    @GetMapping
    public ApiResponse<List<Appointment>> findAll() {
        return ApiResponse.success("Appointments fetched", appointmentService.findAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<Appointment> findById(@PathVariable Long id) {
        return ApiResponse.success("Appointment fetched", appointmentService.findById(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<Appointment> update(@PathVariable Long id, @Valid @RequestBody Appointment appointment) {
        return ApiResponse.success("Appointment updated", appointmentService.update(id, appointment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        appointmentService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Appointment deleted", null));
    }

    @GetMapping("/calendar")
    public ApiResponse<List<Appointment>> calendar(
            @RequestParam Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ApiResponse.success("Doctor calendar fetched", appointmentService.findDoctorCalendar(doctorId, date));
    }

    @GetMapping("/patient/{patientId}")
    public ApiResponse<List<Appointment>> patientAppointments(@PathVariable Long patientId) {
        return ApiResponse.success(
                "Patient appointments fetched",
                appointmentService.findPatientAppointments(patientId)
        );
    }
}
