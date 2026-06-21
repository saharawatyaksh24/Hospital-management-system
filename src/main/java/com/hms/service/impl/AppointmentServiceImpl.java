package com.hms.service.impl;

import com.hms.entity.Appointment;
import com.hms.entity.AppointmentStatus;
import com.hms.exception.BadRequestException;
import com.hms.exception.ResourceNotFoundException;
import com.hms.repository.AppointmentRepository;
import com.hms.service.AppointmentService;
import com.hms.service.DoctorService;
import com.hms.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientService patientService;
    private final DoctorService doctorService;

    @Override
    public Appointment create(Appointment appointment) {
        appointment.setPatient(patientService.findById(appointment.getPatient().getId()));
        appointment.setDoctor(doctorService.findById(appointment.getDoctor().getId()));
        validateDoctorSlot(appointment, null);
        return appointmentRepository.save(appointment);
    }

    @Override
    public List<Appointment> findAll() {
        return appointmentRepository.findAll();
    }

    @Override
    public Appointment findById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id " + id));
    }

    @Override
    public Appointment update(Long id, Appointment appointment) {
        Appointment existing = findById(id);
        appointment.setPatient(patientService.findById(appointment.getPatient().getId()));
        appointment.setDoctor(doctorService.findById(appointment.getDoctor().getId()));
        validateDoctorSlot(appointment, id);
        existing.setPatient(appointment.getPatient());
        existing.setDoctor(appointment.getDoctor());
        existing.setAppointmentDateTime(appointment.getAppointmentDateTime());
        existing.setStatus(appointment.getStatus());
        existing.setReason(appointment.getReason());
        existing.setNotes(appointment.getNotes());
        return appointmentRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        appointmentRepository.delete(findById(id));
    }

    @Override
    public List<Appointment> findDoctorCalendar(Long doctorId, LocalDate date) {
        doctorService.findById(doctorId);
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay().minusNanos(1);
        return appointmentRepository.findByDoctorIdAndAppointmentDateTimeBetweenOrderByAppointmentDateTime(
                doctorId, start, end);
    }

    @Override
    public List<Appointment> findPatientAppointments(Long patientId) {
        patientService.findById(patientId);
        return appointmentRepository.findByPatientIdOrderByAppointmentDateTimeDesc(patientId);
    }

    private void validateDoctorSlot(Appointment appointment, Long currentAppointmentId) {
        if (appointment.getPatient() == null || appointment.getPatient().getId() == null) {
            throw new BadRequestException("Patient id is required");
        }
        if (appointment.getDoctor() == null || appointment.getDoctor().getId() == null) {
            throw new BadRequestException("Doctor id is required");
        }
        boolean slotTaken = appointmentRepository.existsByDoctorIdAndAppointmentDateTimeAndStatusNot(
                appointment.getDoctor().getId(),
                appointment.getAppointmentDateTime(),
                AppointmentStatus.CANCELLED
        );
        if (!slotTaken) {
            return;
        }
        if (currentAppointmentId != null) {
            Appointment current = findById(currentAppointmentId);
            boolean sameSlot = current.getDoctor().getId().equals(appointment.getDoctor().getId())
                    && current.getAppointmentDateTime().equals(appointment.getAppointmentDateTime());
            if (sameSlot) {
                return;
            }
        }
        throw new BadRequestException("Doctor already has an appointment at this time");
    }
}
