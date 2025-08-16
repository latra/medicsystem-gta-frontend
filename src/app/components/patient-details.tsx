'use client'

import { Patient, PatientVisit, apiCall, getPatientVisits } from '../../lib/api'
import { XMarkIcon, PencilIcon, CheckIcon, XCircleIcon, ClockIcon, UserIcon, PlusIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import VisitDetails from './visit-details'
import CreateVisit from './create-visit'

interface PatientDetailsProps {
  patient: Patient | null
  isOpen: boolean
  onClose: () => void
  onPatientUpdate?: (updatedPatient: Patient) => void
}

type TabType = 'info' | 'history'

export default function PatientDetails({ patient, isOpen, onClose, onPatientUpdate }: PatientDetailsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editedPatient, setEditedPatient] = useState<Patient | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('info')
  const [visits, setVisits] = useState<PatientVisit[]>([])
  const [visitsLoading, setVisitsLoading] = useState(false)
  const [visitsError, setVisitsError] = useState<string | null>(null)
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null)
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false)
  const [isCreateVisitModalOpen, setIsCreateVisitModalOpen] = useState(false)
  const [isNewlyCreatedVisit, setIsNewlyCreatedVisit] = useState(false)

  const fetchVisits = async () => {
    if (!patient) return
    
    setVisitsLoading(true)
    setVisitsError(null)
    try {
      const visitsData = await getPatientVisits(patient.dni)
      setVisits(visitsData)
    } catch (error) {
      console.error('Error fetching visits:', error)
      setVisitsError('Error al cargar el historial de visitas')
    } finally {
      setVisitsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'history' && patient && isOpen) {
      fetchVisits()
    }
  }, [activeTab, patient, isOpen])

  console.log('PatientDetails render:', { isOpen, patient: patient?.name })
  
  if (!isOpen || !patient) return null

  const formatSex = (sex: string) => {
    return sex === 'male' ? 'Masculino' : 'Femenino'
  }

  const formatVisitStatus = (status: string) => {
    switch (status) {
      case 'admission': return 'Ingreso'
      case 'discharge': return 'Alta'
      case 'pending': return 'Pendiente'
      default: return status
    }
  }

  const formatAttentionType = (type: string) => {
    switch (type) {
      case 'street': return 'Calle'
      case 'hospital': return 'Hospital'
      case 'traslad': return 'Traslado'
      case 'other': return 'Otro'
      case 'headquarters': return 'Sede'
      case 'home': return 'Casa'
      default: return type
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleEdit = () => {
    setEditedPatient({ ...patient })
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditedPatient(null)
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!editedPatient) return

    setIsLoading(true)
    try {
      const updatedPatient = await apiCall<Patient>(`/patients/${patient.dni}`, {
        method: 'PUT',
        body: JSON.stringify({
          age: editedPatient.age,
          phone: editedPatient.phone,
          allergies: editedPatient.allergies,
          medical_notes: editedPatient.medical_notes,
          notes: editedPatient.notes
        })
      })

      onPatientUpdate?.(updatedPatient)
      setIsEditing(false)
      setEditedPatient(null)
    } catch (error) {
      console.error('Error updating patient:', error)
      alert('Error al actualizar el paciente')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVisitClick = (visitId: string) => {
    setSelectedVisitId(visitId)
    setIsVisitModalOpen(true)
  }

  const handleVisitModalClose = () => {
    setIsVisitModalOpen(false)
    setSelectedVisitId(null)
    setIsNewlyCreatedVisit(false)
  }

  const handleVisitUpdate = () => {
    // Refresh visits list when a visit is updated
    fetchVisits()
  }

  const handleCreateVisit = () => {
    setIsCreateVisitModalOpen(true)
  }

  const handleCreateVisitClose = () => {
    setIsCreateVisitModalOpen(false)
  }

  const handleVisitCreated = (visitId: string) => {
    // Refresh visits list when a new visit is created
    fetchVisits()
    // Automatically open the visit details for the newly created visit
    setSelectedVisitId(visitId)
    setIsNewlyCreatedVisit(true)
    setIsVisitModalOpen(true)
  }

  const currentPatient = editedPatient || patient

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      ></div>

      {/* Modal panel */}
      <div className="relative bg-white shadow-sm rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-hospital-blue text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Detalles del Paciente</h3>
              <p className="text-gray-300 text-sm mt-1">{currentPatient.name} - {currentPatient.dni}</p>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <button
                  onClick={handleCreateVisit}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
                  title="Ingresar paciente"
                >
                  <PlusIcon className="h-4 w-4" />
                  Ingresar
                </button>
              )}
              {!isEditing && activeTab === 'info' && (
                <button
                  onClick={handleEdit}
                  className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-md transition-colors"
                  title="Editar paciente"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-300 hover:text-white p-2 rounded-md transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'info'
                  ? 'border-hospital-blue text-hospital-blue'
                  : 'border-transparent text-gray-900 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UserIcon className="h-4 w-4 inline mr-2" />
              Información
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-hospital-blue text-hospital-blue'
                  : 'border-transparent text-gray-900 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ClockIcon className="h-4 w-4 inline mr-2" />
              Historial
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'info' ? (
            <>
              {/* Información Personal */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
                <h4 className="text-sm font-bold text-black uppercase tracking-wide mb-4">
                  Información Personal
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-black mb-1">Edad</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={currentPatient.age}
                        onChange={(e) => setEditedPatient(prev => prev ? { ...prev, age: parseInt(e.target.value) || 0 } : null)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#4fbbeb] focus:border-[#4fbbeb] text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300">
                        {currentPatient.age} años
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black mb-1">Sexo</label>
                    <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300">
                      {formatSex(currentPatient.sex)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black mb-1">Teléfono</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={currentPatient.phone}
                        onChange={(e) => setEditedPatient(prev => prev ? { ...prev, phone: e.target.value } : null)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#4fbbeb] focus:border-[#4fbbeb] text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300">
                        {currentPatient.phone || 'No registrado'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black mb-1">Tipo Sangre</label>
                    <div className="inline-block bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium">
                      {currentPatient.blood_type}
                    </div>
                  </div>
                </div>
              </div>

              {/* Información Médica */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
                <h4 className="text-sm font-bold text-black uppercase tracking-wide mb-4">
                  Información Médica
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-black mb-1">Alergias</label>
                    {isEditing ? (
                      <textarea
                        value={currentPatient.allergies}
                        onChange={(e) => setEditedPatient(prev => prev ? { ...prev, allergies: e.target.value } : null)}
                        rows={2}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#4fbbeb] focus:border-[#4fbbeb] text-sm resize-none"
                        placeholder="Ingrese las alergias..."
                      />
                    ) : (
                      <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300 min-h-[40px] flex items-center">
                        {currentPatient.allergies || 'Ninguna alergia registrada'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black mb-1">Notas Médicas</label>
                    {isEditing ? (
                      <textarea
                        value={currentPatient.medical_notes}
                        onChange={(e) => setEditedPatient(prev => prev ? { ...prev, medical_notes: e.target.value } : null)}
                        rows={3}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#4fbbeb] focus:border-[#4fbbeb] text-sm resize-none"
                        placeholder="Ingrese notas médicas..."
                      />
                    ) : (
                      <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300 min-h-[60px] whitespace-pre-wrap">
                        {currentPatient.medical_notes || 'No hay notas médicas registradas'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Notas Generales */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h4 className="text-sm font-bold text-black uppercase tracking-wide mb-4">
                  Notas Generales
                </h4>
                <div>
                  <label className="block text-xs font-medium text-black mb-1">Observaciones</label>
                  {isEditing ? (
                    <textarea
                      value={currentPatient.notes}
                      onChange={(e) => setEditedPatient(prev => prev ? { ...prev, notes: e.target.value } : null)}
                      rows={3}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#4fbbeb] focus:border-[#4fbbeb] text-sm resize-none"
                      placeholder="Ingrese notas generales..."
                    />
                  ) : (
                    <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300 min-h-[60px] whitespace-pre-wrap">
                      {currentPatient.notes || 'No hay notas generales registradas'}
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Historial de Visitas */
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h4 className="text-sm font-bold text-black uppercase tracking-wide mb-4">
                Historial de Visitas
              </h4>
              
              {visitsLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hospital-blue"></div>
                </div>
              ) : visitsError ? (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm text-red-800">{visitsError}</p>
                </div>
              ) : visits.length === 0 ? (
                <div className="text-center py-8">
                  <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay visitas registradas para este paciente</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha Ingreso
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lugar de la atención
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Atendido por
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Motivo
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ubicación
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {visits.map((visit) => (
                        <tr 
                          key={visit.visit_id} 
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleVisitClick(visit.visit_id)}
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(visit.date_of_admission)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              visit.visit_status === 'admission' 
                                ? 'bg-blue-100 text-blue-800'
                                : visit.visit_status === 'discharge'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {formatVisitStatus(visit.visit_status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {formatAttentionType(visit.attention_place)} {visit.attention_details ? `- ${visit.attention_details}` : ''}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {visit.doctor_dni} | {visit.doctor_name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 max-w-md">
                            <div className="whitespace-pre-wrap break-words">
                              {visit.reason || 'No especificado'}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {visit.location || 'No especificada'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg border-t border-gray-200">
          {isEditing && activeTab === 'info' ? (
            <>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isLoading}
                className="bg-hospital-blue hover:bg-hospital-blue/80 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4fbbeb] disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Guardando...' : 'Guardar'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="bg-hospital-blue hover:bg-hospital-blue/80 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4fbbeb] transition-colors"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>

      {/* Visit Details Modal */}
      <VisitDetails
        visitId={selectedVisitId}
        isOpen={isVisitModalOpen}
        onClose={handleVisitModalClose}
        onVisitUpdate={handleVisitUpdate}
        autoEditMode={isNewlyCreatedVisit}
      />

      {/* Create Visit Modal */}
      <CreateVisit
        patientDni={patient.dni}
        patientName={patient.name}
        isOpen={isCreateVisitModalOpen}
        onClose={handleCreateVisitClose}
        onVisitCreated={handleVisitCreated}
      />
    </div>
  )
} 