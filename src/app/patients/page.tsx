'use client'

import { useState } from 'react'
import Navbar from "../components/navbar"
import PatientsTable from "../components/patients-table"
import PatientDetails from "../components/patient-details"
import RegisterPatient from "../components/register-patient"
import DeleteConfirmation from "../components/delete-confirmation"
import { deletePatient, Patient } from "../../lib/api"

export default function Patients() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handlePatientDetails = (patient: Patient) => {
    console.log('handlePatientDetails called:', patient.name)
    setSelectedPatient(patient)
    setIsDetailsOpen(true)
  }

  const handleCloseDetails = () => {
    console.log('handleCloseDetails called')
    setIsDetailsOpen(false)
    setSelectedPatient(null)
  }

  const handleOpenRegister = () => {
    setIsRegisterOpen(true)
  }

  const handleCloseRegister = () => {
    setIsRegisterOpen(false)
  }

  const handlePatientCreated = () => {
    // Trigger a refresh of the patients table
    setRefreshTrigger(prev => prev + 1)
  }

  const handlePatientUpdated = (updatedPatient: Patient) => {
    // Update the selected patient with the new data
    setSelectedPatient(updatedPatient)
    // Trigger a refresh of the patients table
    setRefreshTrigger(prev => prev + 1)
  }

  const handlePatientDelete = async (patient: Patient) => {
    try {
      await deletePatient(patient.dni)
      setRefreshTrigger(prev => prev + 1)
    } catch (error) {
      console.error('Error deleting patient:', error)
      throw error // Re-throw to be handled by the confirmation component
    }
  }

  const handleOpenDelete = (patient: Patient) => {
    setPatientToDelete(patient)
    setIsDeleteOpen(true)
  }

  const handleCloseDelete = () => {
    setIsDeleteOpen(false)
    setPatientToDelete(null)
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
              <button
                onClick={handleOpenRegister}
                className="bg-hospital-blue hover:bg-hospital-blue/80 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                + Registrar Nuevo Paciente
              </button>
            </div>
            
            <PatientsTable 
              onPatientDetails={handlePatientDetails} 
              refreshTrigger={refreshTrigger}
              onPatientDelete={handleOpenDelete}
            />
          </div>
        </div>
      </div>

      <PatientDetails
        patient={selectedPatient}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        onPatientUpdate={handlePatientUpdated}
      />

      <RegisterPatient
        isOpen={isRegisterOpen}
        onClose={handleCloseRegister}
        onPatientCreated={handlePatientCreated}
      />

      <DeleteConfirmation
        patient={patientToDelete}
        isOpen={isDeleteOpen}
        onClose={handleCloseDelete}
        onConfirm={handlePatientDelete}
      />
    </>
  )
}