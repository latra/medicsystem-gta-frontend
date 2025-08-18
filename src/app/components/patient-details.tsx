'use client'

import { Patient, PatientComplete, PatientSummary, VisitSummary, getPatientComplete, getPatientVisits, updatePatient, updatePatientMedicalHistory, addBloodAnalysis, addRadiologyStudy, BloodAnalysisCreate, RadiologyStudyCreate, PatientUpdate, PatientMedicalHistoryUpdate } from '../../lib/api'
import { XMarkIcon, PencilIcon, CheckIcon, XCircleIcon, ClockIcon, UserIcon, PlusIcon, HeartIcon, DocumentTextIcon, BeakerIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import VisitDetails from './visit-details'
import CreateVisit from './create-visit'

interface PatientDetailsProps {
  patient: PatientSummary | null
  isOpen: boolean
  onClose: () => void
  onPatientUpdate?: (updatedPatient: PatientSummary) => void
}

type TabType = 'info' | 'history' | 'medical' | 'blood' | 'radiology'

export default function PatientDetails({ patient, isOpen, onClose, onPatientUpdate }: PatientDetailsProps) {
  const [patientComplete, setPatientComplete] = useState<PatientComplete | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('info')
  const [visits, setVisits] = useState<VisitSummary[]>([])
  const [visitsLoading, setVisitsLoading] = useState(false)
  const [visitsError, setVisitsError] = useState<string | null>(null)
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null)
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false)
  const [isCreateVisitModalOpen, setIsCreateVisitModalOpen] = useState(false)
  const [isNewlyCreatedVisit, setIsNewlyCreatedVisit] = useState(false)

  // Form states
  const [basicInfo, setBasicInfo] = useState<PatientUpdate>({})
  const [medicalHistory, setMedicalHistory] = useState<PatientMedicalHistoryUpdate>({})
  const [newBloodAnalysis, setNewBloodAnalysis] = useState<BloodAnalysisCreate | null>(null)
  const [newRadiologyStudy, setNewRadiologyStudy] = useState<RadiologyStudyCreate | null>(null)
  const [showBloodAnalysisForm, setShowBloodAnalysisForm] = useState(false)
  const [showRadiologyForm, setShowRadiologyForm] = useState(false)

  const fetchPatientComplete = async () => {
    if (!patient) return
    
    setIsLoading(true)
    try {
      const completeData = await getPatientComplete(patient.dni)
      setPatientComplete(completeData)
      
      // Initialize form data
      setBasicInfo({
        name: completeData.name,
        age: completeData.age,
        phone: completeData.phone || '',
      })
      
      setMedicalHistory({
        allergies: completeData.medical_history.allergies,
        medical_notes: completeData.medical_history.medical_notes,
        major_surgeries: completeData.medical_history.major_surgeries,
        current_medications: completeData.medical_history.current_medications,
        chronic_conditions: completeData.medical_history.chronic_conditions,
        family_history: completeData.medical_history.family_history
      })
    } catch (error) {
      console.error('Error fetching complete patient data:', error)
    } finally {
      setIsLoading(false)
    }
  }

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
    if (patient && isOpen) {
      fetchPatientComplete()
    }
  }, [patient, isOpen])

  useEffect(() => {
    if (activeTab === 'history' && patient && isOpen) {
      fetchVisits()
    }
  }, [activeTab, patient, isOpen])

  if (!isOpen || !patient) return null

  const formatSex = (sex: string) => {
    return sex === 'male' ? 'Masculino' : 'Femenino'
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

  const arrayToString = (arr: string[]): string => {
    return arr.join(', ')
  }

  const stringToArray = (str: string): string[] => {
    if (!str.trim()) return []
    return str.split(',').map(item => item.trim()).filter(item => item.length > 0)
  }

  const handleSaveBasicInfo = async () => {
    if (!patient || !patientComplete) return

    setIsLoading(true)
    try {
      await updatePatient(patient.dni, basicInfo)
      await fetchPatientComplete()
      setIsEditing(false)
      
      // Update the summary patient data
      onPatientUpdate?.({
        ...patient,
        name: basicInfo.name || patient.name,
        age: basicInfo.age || patient.age,
      })
    } catch (error) {
      console.error('Error updating patient:', error)
      alert('Error al actualizar el paciente')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveMedicalHistory = async () => {
    if (!patient) return

    setIsLoading(true)
    try {
      await updatePatientMedicalHistory(patient.dni, medicalHistory)
      await fetchPatientComplete()
      alert('Historial médico actualizado correctamente')
    } catch (error) {
      console.error('Error updating medical history:', error)
      alert('Error al actualizar el historial médico')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddBloodAnalysis = async () => {
    if (!patient || !newBloodAnalysis) return

    setIsLoading(true)
    try {
      await addBloodAnalysis(patient.dni, newBloodAnalysis)
      await fetchPatientComplete()
      setShowBloodAnalysisForm(false)
      setNewBloodAnalysis(null)
      alert('Análisis de sangre agregado correctamente')
    } catch (error) {
      console.error('Error adding blood analysis:', error)
      alert('Error al agregar el análisis de sangre')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddRadiologyStudy = async () => {
    if (!patient || !newRadiologyStudy) return

    setIsLoading(true)
    try {
      await addRadiologyStudy(patient.dni, newRadiologyStudy)
      await fetchPatientComplete()
      setShowRadiologyForm(false)
      setNewRadiologyStudy(null)
      alert('Estudio radiológico agregado correctamente')
    } catch (error) {
      console.error('Error adding radiology study:', error)
      alert('Error al agregar el estudio radiológico')
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
    fetchVisits()
  }

  const handleCreateVisit = () => {
    setIsCreateVisitModalOpen(true)
  }

  const handleCreateVisitClose = () => {
    setIsCreateVisitModalOpen(false)
  }

  const handleVisitCreated = (visitId: string) => {
    fetchVisits()
    setSelectedVisitId(visitId)
    setIsNewlyCreatedVisit(true)
    setIsVisitModalOpen(true)
  }

  if (isLoading && !patientComplete) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative bg-white shadow-sm rounded-lg max-w-6xl w-full p-8">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!patientComplete) return null

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
              <p className="text-gray-300 text-sm mt-1">{patientComplete.name} - {patientComplete.dni}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCreateVisit}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
                title="Ingresar paciente"
              >
                <PlusIcon className="h-4 w-4" />
                Ingresar
              </button>
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
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'info'
                  ? 'border-hospital-blue text-hospital-blue'
                  : 'border-transparent text-gray-900 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UserIcon className="h-4 w-4 inline mr-2" />
              Información
            </button>
            <button
              onClick={() => setActiveTab('medical')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'medical'
                  ? 'border-hospital-blue text-hospital-blue'
                  : 'border-transparent text-gray-900 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <HeartIcon className="h-4 w-4 inline mr-2" />
              Historial Médico
            </button>
            <button
              onClick={() => setActiveTab('blood')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'blood'
                  ? 'border-hospital-blue text-hospital-blue'
                  : 'border-transparent text-gray-900 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BeakerIcon className="h-4 w-4 inline mr-2" />
              Análisis
            </button>
            <button
              onClick={() => setActiveTab('radiology')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'radiology'
                  ? 'border-hospital-blue text-hospital-blue'
                  : 'border-transparent text-gray-900 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <DocumentTextIcon className="h-4 w-4 inline mr-2" />
              Radiología
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'history'
                  ? 'border-hospital-blue text-hospital-blue'
                  : 'border-transparent text-gray-900 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ClockIcon className="h-4 w-4 inline mr-2" />
              Visitas
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Información Básica Tab */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Información Personal */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-bold text-black uppercase tracking-wide">
                    Información Personal
                  </h4>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-hospital-blue hover:text-hospital-blue/80 p-1"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-black mb-1">Nombre</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={basicInfo.name || ''}
                        onChange={(e) => setBasicInfo(prev => ({ ...prev, name: e.target.value }))}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300">
                        {patientComplete.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black mb-1">DNI</label>
                    <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300">
                      {patientComplete.dni}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black mb-1">Edad</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={basicInfo.age || ''}
                        onChange={(e) => setBasicInfo(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300">
                        {patientComplete.age} años
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black mb-1">Sexo</label>
                    <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300">
                      {formatSex(patientComplete.sex)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black mb-1">Teléfono</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={basicInfo.phone || ''}
                        onChange={(e) => setBasicInfo(prev => ({ ...prev, phone: e.target.value }))}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300">
                        {patientComplete.phone || 'No registrado'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black mb-1">Tipo Sangre</label>
                    <div className="inline-block bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium">
                      {patientComplete.blood_type}
                    </div>
                  </div>
                </div>
              </div>


              {/* Timestamps */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h4 className="text-sm font-bold text-black uppercase tracking-wide mb-4">
                  Información del Registro
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-black mb-1">Creado</label>
                    <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300">
                      {formatDate(patientComplete.created_at)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black mb-1">Última Actualización</label>
                    <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300">
                      {formatDate(patientComplete.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Historial Médico Tab */}
          {activeTab === 'medical' && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-bold text-black uppercase tracking-wide">
                    Historial Médico Detallado
                  </h4>
                  <p className="text-xs text-gray-600">
                    Última actualización: {formatDate(patientComplete.medical_history.last_updated)}
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Alergias */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alergias Conocidas
                    </label>
                    <textarea
                      value={arrayToString(medicalHistory.allergies || [])}
                      onChange={(e) => setMedicalHistory(prev => ({ ...prev, allergies: stringToArray(e.target.value) }))}
                      rows={2}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Separar con comas: polen, polvo, alimentos..."
                    />
                  </div>

                  {/* Cirugías Mayores */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cirugías Mayores
                    </label>
                    <textarea
                      value={arrayToString(medicalHistory.major_surgeries || [])}
                      onChange={(e) => setMedicalHistory(prev => ({ ...prev, major_surgeries: stringToArray(e.target.value) }))}
                      rows={2}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Separar con comas: apendicetomía 2020, bypass 2018..."
                    />
                  </div>

                  {/* Medicamentos Actuales */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medicamentos Actuales
                    </label>
                    <textarea
                      value={arrayToString(medicalHistory.current_medications || [])}
                      onChange={(e) => setMedicalHistory(prev => ({ ...prev, current_medications: stringToArray(e.target.value) }))}
                      rows={2}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Separar con comas: aspirina 100mg, metformina 500mg..."
                    />
                  </div>

                  {/* Condiciones Crónicas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condiciones Crónicas
                    </label>
                    <textarea
                      value={arrayToString(medicalHistory.chronic_conditions || [])}
                      onChange={(e) => setMedicalHistory(prev => ({ ...prev, chronic_conditions: stringToArray(e.target.value) }))}
                      rows={2}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Separar con comas: diabetes tipo 2, hipertensión..."
                    />
                  </div>

                  {/* Historial Familiar */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Historial Familiar
                    </label>
                    <textarea
                      value={medicalHistory.family_history || ''}
                      onChange={(e) => setMedicalHistory(prev => ({ ...prev, family_history: e.target.value }))}
                      rows={3}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Antecedentes médicos familiares relevantes..."
                    />
                  </div>

                  {/* Notas Médicas Generales */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notas Médicas Generales
                    </label>
                    <textarea
                      value={medicalHistory.medical_notes || ''}
                      onChange={(e) => setMedicalHistory(prev => ({ ...prev, medical_notes: e.target.value }))}
                      rows={4}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Información médica adicional relevante..."
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveMedicalHistory}
                      disabled={isLoading}
                      className="px-4 py-2 bg-hospital-blue text-white rounded-md hover:bg-hospital-blue/80 disabled:opacity-50"
                    >
                      {isLoading ? 'Guardando...' : 'Actualizar Historial Médico'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Análisis de Sangre Tab */}
          {activeTab === 'blood' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold">Análisis de Sangre</h4>
                <button
                  onClick={() => setShowBloodAnalysisForm(!showBloodAnalysisForm)}
                  className="bg-hospital-blue text-white px-4 py-2 rounded-md hover:bg-hospital-blue/80"
                >
                  <PlusIcon className="h-4 w-4 inline mr-2" />
                  Nuevo Análisis
                </button>
              </div>

              {/* Formulario para nuevo análisis */}
              {showBloodAnalysisForm && (
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h5 className="font-medium mb-4">Agregar Nuevo Análisis de Sangre</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Glóbulos Rojos (millones/μL) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        onChange={(e) => setNewBloodAnalysis(prev => ({ ...prev, red_blood_cells: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hemoglobina (g/dL) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        onChange={(e) => setNewBloodAnalysis(prev => ({ ...prev, hemoglobin: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hematocrito (%) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        onChange={(e) => setNewBloodAnalysis(prev => ({ ...prev, hematocrit: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Plaquetas (/μL) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        onChange={(e) => setNewBloodAnalysis(prev => ({ ...prev, platelets: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Linfocitos (%) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        onChange={(e) => setNewBloodAnalysis(prev => ({ ...prev, lymphocytes: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Glucosa (mg/dL) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        onChange={(e) => setNewBloodAnalysis(prev => ({ ...prev, glucose: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Colesterol (mg/dL) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        onChange={(e) => setNewBloodAnalysis(prev => ({ ...prev, cholesterol: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Urea (mg/dL) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        onChange={(e) => setNewBloodAnalysis(prev => ({ ...prev, urea: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        required
                      />
                    </div>
                    <div className="md:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notas Adicionales
                      </label>
                      <textarea
                        onChange={(e) => setNewBloodAnalysis(prev => ({ ...prev, notes: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Observaciones del análisis..."
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowBloodAnalysisForm(false)
                        setNewBloodAnalysis(null)
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddBloodAnalysis}
                      disabled={isLoading || !newBloodAnalysis?.red_blood_cells}
                      className="px-4 py-2 bg-hospital-blue text-white rounded-md hover:bg-hospital-blue/80 disabled:opacity-50"
                    >
                      {isLoading ? 'Guardando...' : 'Agregar Análisis'}
                    </button>
                  </div>
                </div>
              )}

              {/* Lista de análisis existentes */}
              <div className="space-y-4">
                {patientComplete.medical_history.blood_analyses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No hay análisis de sangre registrados
                  </div>
                ) : (
                  patientComplete.medical_history.blood_analyses.map((analysis) => (
                    <div key={analysis.analysis_id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h6 className="font-medium text-gray-900">
                          Análisis #{analysis.analysis_id.slice(-8)}
                        </h6>
                        <span className="text-sm text-gray-500">
                          {formatDate(analysis.date_performed)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="font-medium">Glóbulos Rojos:</span> {analysis.red_blood_cells} millones/μL
                        </div>
                        <div>
                          <span className="font-medium">Hemoglobina:</span> {analysis.hemoglobin} g/dL
                        </div>
                        <div>
                          <span className="font-medium">Hematocrito:</span> {analysis.hematocrit}%
                        </div>
                        <div>
                          <span className="font-medium">Plaquetas:</span> {analysis.platelets}/μL
                        </div>
                        <div>
                          <span className="font-medium">Linfocitos:</span> {analysis.lymphocytes}%
                        </div>
                        <div>
                          <span className="font-medium">Glucosa:</span> {analysis.glucose} mg/dL
                        </div>
                        <div>
                          <span className="font-medium">Colesterol:</span> {analysis.cholesterol} mg/dL
                        </div>
                        <div>
                          <span className="font-medium">Urea:</span> {analysis.urea} mg/dL
                        </div>
                      </div>
                      {analysis.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <span className="font-medium text-sm">Notas:</span>
                          <p className="text-sm text-gray-700 mt-1">{analysis.notes}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Estudios Radiológicos Tab */}
          {activeTab === 'radiology' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold">Estudios Radiológicos</h4>
                <button
                  onClick={() => setShowRadiologyForm(!showRadiologyForm)}
                  className="bg-hospital-blue text-white px-4 py-2 rounded-md hover:bg-hospital-blue/80"
                >
                  <PlusIcon className="h-4 w-4 inline mr-2" />
                  Nuevo Estudio
                </button>
              </div>

              {/* Formulario para nuevo estudio */}
              {showRadiologyForm && (
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h5 className="font-medium mb-4">Agregar Nuevo Estudio Radiológico</h5>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo de Estudio *
                        </label>
                        <input
                          type="text"
                          onChange={(e) => setNewRadiologyStudy(prev => ({ ...prev, study_type: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="Ej: Rayos X, CT, MRI, Ecografía..."
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Parte del Cuerpo *
                        </label>
                        <input
                          type="text"
                          onChange={(e) => setNewRadiologyStudy(prev => ({ ...prev, body_part: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="Ej: Tórax, Abdomen, Pierna derecha..."
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hallazgos *
                      </label>
                      <textarea
                        onChange={(e) => setNewRadiologyStudy(prev => ({ ...prev, findings: e.target.value }))}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Descripción detallada de los hallazgos..."
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          URL de Imagen
                        </label>
                        <input
                          type="url"
                          onChange={(e) => setNewRadiologyStudy(prev => ({ ...prev, image_url: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Radiólogo (DNI)
                        </label>
                        <input
                          type="text"
                          onChange={(e) => setNewRadiologyStudy(prev => ({ ...prev, radiologist: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="DNI del radiólogo interpretante..."
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowRadiologyForm(false)
                        setNewRadiologyStudy(null)
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddRadiologyStudy}
                      disabled={isLoading || !newRadiologyStudy?.study_type}
                      className="px-4 py-2 bg-hospital-blue text-white rounded-md hover:bg-hospital-blue/80 disabled:opacity-50"
                    >
                      {isLoading ? 'Guardando...' : 'Agregar Estudio'}
                    </button>
                  </div>
                </div>
              )}

              {/* Lista de estudios existentes */}
              <div className="space-y-4">
                {patientComplete.medical_history.radiology_studies.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No hay estudios radiológicos registrados
                  </div>
                ) : (
                  patientComplete.medical_history.radiology_studies.map((study) => (
                    <div key={study.study_id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h6 className="font-medium text-gray-900">
                          {study.study_type} - {study.body_part}
                        </h6>
                        <span className="text-sm text-gray-500">
                          {formatDate(study.date_performed)}
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <span className="font-medium text-sm">Hallazgos:</span>
                          <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{study.findings}</p>
                        </div>
                        {study.radiologist && (
                          <div>
                            <span className="font-medium text-sm">Radiólogo:</span>
                            <span className="text-sm text-gray-700 ml-2">{study.radiologist}</span>
                          </div>
                        )}
                        {study.image_url && (
                          <div>
                            <span className="font-medium text-sm">Imagen:</span>
                            <a
                              href={study.image_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-hospital-blue hover:underline ml-2"
                            >
                              Ver imagen
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Historial de Visitas Tab */}
          {activeTab === 'history' && (
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
                          Fecha
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lugar
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Médico
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Motivo
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
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {visit.visit_status === 'admission' ? 'Ingresado/a' : 'Alta'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {visit.attention_place} {visit.attention_details ? `- ${visit.attention_details}` : ''}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {visit.doctor_name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 max-w-md">
                            <div className="whitespace-pre-wrap break-words">
                              {visit.reason || 'No especificado'}
                            </div>
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
          <button
            type="button"
            onClick={onClose}
            className="bg-hospital-blue hover:bg-hospital-blue/80 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4fbbeb] transition-colors"
          >
            Cerrar
          </button>
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