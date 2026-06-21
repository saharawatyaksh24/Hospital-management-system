package com.hms.service.impl;

import com.hms.entity.MedicalRecord;
import com.hms.exception.ResourceNotFoundException;
import com.hms.repository.MedicalRecordRepository;
import com.hms.service.AppointmentService;
import com.hms.service.DoctorService;
import com.hms.service.MedicalRecordService;
import com.hms.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicalRecordServiceImpl implements MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final PatientService patientService;
    private final DoctorService doctorService;
    private final AppointmentService appointmentService;

    @Override
    public MedicalRecord create(MedicalRecord medicalRecord) {
        attachReferences(medicalRecord);
        return medicalRecordRepository.save(medicalRecord);
    }

    @Override
    public List<MedicalRecord> findAll() {
        return medicalRecordRepository.findAll();
    }

    @Override
    public MedicalRecord findById(Long id) {
        return medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found with id " + id));
    }

    @Override
    public MedicalRecord update(Long id, MedicalRecord medicalRecord) {
        MedicalRecord existing = findById(id);
        attachReferences(medicalRecord);
        existing.setPatient(medicalRecord.getPatient());
        existing.setDoctor(medicalRecord.getDoctor());
        existing.setAppointment(medicalRecord.getAppointment());
        existing.setVisitDate(medicalRecord.getVisitDate());
        existing.setDiagnosis(medicalRecord.getDiagnosis());
        existing.setTreatment(medicalRecord.getTreatment());
        existing.setPrescription(medicalRecord.getPrescription());
        existing.setNotes(medicalRecord.getNotes());
        return medicalRecordRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        medicalRecordRepository.delete(findById(id));
    }

    @Override
    public List<MedicalRecord> findByPatient(Long patientId) {
        patientService.findById(patientId);
        return medicalRecordRepository.findByPatientIdOrderByVisitDateDesc(patientId);
    }

    private void attachReferences(MedicalRecord medicalRecord) {
        medicalRecord.setPatient(patientService.findById(medicalRecord.getPatient().getId()));
        if (medicalRecord.getDoctor() != null && medicalRecord.getDoctor().getId() != null) {
            medicalRecord.setDoctor(doctorService.findById(medicalRecord.getDoctor().getId()));
        }
        if (medicalRecord.getAppointment() != null && medicalRecord.getAppointment().getId() != null) {
            medicalRecord.setAppointment(appointmentService.findById(medicalRecord.getAppointment().getId()));
        }
    }
}
