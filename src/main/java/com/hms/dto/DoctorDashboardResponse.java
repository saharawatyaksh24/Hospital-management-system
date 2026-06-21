package com.hms.dto;

import com.hms.entity.Appointment;
import com.hms.entity.Doctor;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class DoctorDashboardResponse {
    private Doctor doctor;
    private long todayAppointmentsCount;
    private List<Appointment> todayAppointments;
}
