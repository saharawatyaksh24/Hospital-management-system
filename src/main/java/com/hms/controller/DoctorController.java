package com.hms.controller;

import com.hms.dto.ApiResponse;
import com.hms.dto.DoctorDashboardResponse;
import com.hms.entity.Doctor;
import com.hms.service.AppointmentService;
import com.hms.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;
    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<Doctor>> create(@Valid @RequestBody Doctor doctor) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Doctor created", doctorService.create(doctor)));
    }

    @GetMapping
    public ApiResponse<List<Doctor>> findAll() {
        return ApiResponse.success("Doctors fetched", doctorService.findAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<Doctor> findById(@PathVariable Long id) {
        return ApiResponse.success("Doctor fetched", doctorService.findById(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<Doctor> update(@PathVariable Long id, @Valid @RequestBody Doctor doctor) {
        return ApiResponse.success("Doctor updated", doctorService.update(id, doctor));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        doctorService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Doctor deleted", null));
    }

    @GetMapping("/{id}/dashboard")
    public ApiResponse<DoctorDashboardResponse> dashboard(@PathVariable Long id) {
        Doctor doctor = doctorService.findById(id);
        var todayAppointments = appointmentService.findDoctorCalendar(id, LocalDate.now());
        return ApiResponse.success(
                "Doctor dashboard fetched",
                new DoctorDashboardResponse(doctor, todayAppointments.size(), todayAppointments)
        );
    }
}
