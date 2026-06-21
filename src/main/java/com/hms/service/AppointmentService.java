package com.hms.service;

import com.hms.entity.Appointment;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentService {
    Appointment create(Appointment appointment);

    List<Appointment> findAll();

    Appointment findById(Long id);

    Appointment update(Long id, Appointment appointment);

    void delete(Long id);

    List<Appointment> findDoctorCalendar(Long doctorId, LocalDate date);

    List<Appointment> findPatientAppointments(Long patientId);
}
