package com.hms.repository;

import com.hms.entity.Appointment;
import com.hms.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    boolean existsByDoctorIdAndAppointmentDateTimeAndStatusNot(
            Long doctorId,
            LocalDateTime appointmentDateTime,
            AppointmentStatus status
    );

    List<Appointment> findByDoctorIdAndAppointmentDateTimeBetweenOrderByAppointmentDateTime(
            Long doctorId,
            LocalDateTime start,
            LocalDateTime end
    );

    List<Appointment> findByPatientIdOrderByAppointmentDateTimeDesc(Long patientId);

    long countByDoctorIdAndAppointmentDateTimeBetween(Long doctorId, LocalDateTime start, LocalDateTime end);
}
