'use client'

import { getVisitDetails, updateVisit, dischargeVisit, type VisitDetails } from '../../lib/api'
import { XMarkIcon, PencilIcon, CheckIcon, XCircleIcon, ClockIcon, UserIcon, HeartIcon, ChartBarIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'

interface VisitDetailsProps {
  visitId: string | null
  isOpen: boolean
  onClose: () => void
  onVisitUpdate?: (updatedVisit: VisitDetails) => void
  autoEditMode?: boolean
}

type TabType = 'admission' | 'medical' | 'evolution' | 'discharge'

const attentionPlaces = [
  { value: 'street', label: 'Calle' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'traslad', label: 'Traslado' },
  { value: 'other', label: 'Otro' },
  { value: 'headquarters', label: 'Sede' },
  { value: 'home', label: 'Casa' }
]

export default function VisitDetails({ visitId, isOpen, onClose, onVisitUpdate, autoEditMode }: VisitDetailsProps) {
  const [visit, setVisit] = useState<VisitDetails | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDischarging, setIsDischarging] = useState(false)
  const [editedVisit, setEditedVisit] = useState<VisitDetails | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('admission')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchVisitDetails = async () => {
    if (!visitId) return
    
    setLoading(true)
    setError(null)
    try {
      const visitData = await getVisitDetails(visitId)
      setVisit(visitData)
      setEditedVisit(visitData)
    } catch (error) {
      console.error('Error fetching visit details:', error)
      setError('Error al cargar los detalles de la visita')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && visitId) {
      fetchVisitDetails()
    }
  }, [isOpen, visitId])

  // Auto-edit mode for newly created visits
  useEffect(() => {
    if (autoEditMode && visit && !isEditing) {
      setIsEditing(true)
      setActiveTab('medical')
    }
  }, [autoEditMode, visit, isEditing])

  // Reset active tab when visit status changes
  useEffect(() => {
    const currentVisit = editedVisit || visit
    if (currentVisit && currentVisit.visit_status === 'admission' && activeTab === 'discharge') {
      setActiveTab('evolution')
    }
  }, [editedVisit, visit, activeTab])

  if (!isOpen || !visitId) return null

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
      default: return type
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No registrada'
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
    setEditedVisit(visit ? { ...visit } : null)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditedVisit(visit ? { ...visit } : null)
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!editedVisit) return

    setIsLoading(true)
    try {
      const updatedVisit = await updateVisit(visitId, editedVisit)
      setVisit(updatedVisit)
      onVisitUpdate?.(updatedVisit)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating visit:', error)
      alert('Error al actualizar la visita')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDischarge = async () => {
    if (!visitId) return

    setIsDischarging(true)
    try {
      await dischargeVisit(visitId)
      // Refresh visit details to get updated status
      await fetchVisitDetails()
      if (visit) {
        onVisitUpdate?.({ ...visit, visit_status: 'discharge' })
      }
      alert('Paciente dado de alta exitosamente')
    } catch (error) {
      console.error('Error discharging patient:', error)
      alert('Error al dar de alta al paciente')
    } finally {
      setIsDischarging(false)
    }
  }

  const currentVisit = editedVisit || visit

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative bg-white rounded-lg p-8">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hospital-blue"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
        <div className="relative bg-white rounded-lg p-6 max-w-md w-full">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="bg-hospital-blue hover:bg-hospital-blue/80 text-white font-medium py-2 px-4 rounded-md"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!currentVisit) return null

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
              <h3 className="text-lg font-semibold">Gestión de Visita</h3>
              <p className="text-gray-300 text-sm mt-1">ID: {currentVisit.visit_id} - {formatVisitStatus(currentVisit.visit_status)}</p>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing && currentVisit.visit_status === 'admission' && (
                <button
                  onClick={handleDischarge}
                  disabled={isDischarging}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                  title="Dar de alta al paciente"
                >
                  <ArrowRightIcon className="h-4 w-4" />
                  {isDischarging ? 'Dando de alta...' : 'Dar de Alta'}
                </button>
              )}
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-md transition-colors"
                  title="Editar visita"
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
              onClick={() => setActiveTab('admission')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'admission'
                  ? 'border-hospital-blue text-hospital-blue'
                  : 'border-transparent text-gray-900 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UserIcon className="h-4 w-4 inline mr-2" />
              Ingreso
            </button>
            <button
              onClick={() => setActiveTab('medical')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'medical'
                  ? 'border-hospital-blue text-hospital-blue'
                  : 'border-transparent text-gray-900 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <HeartIcon className="h-4 w-4 inline mr-2" />
              Evaluación Médica
            </button>
            <button
              onClick={() => setActiveTab('evolution')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'evolution'
                  ? 'border-hospital-blue text-hospital-blue'
                  : 'border-transparent text-gray-900 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ChartBarIcon className="h-4 w-4 inline mr-2" />
              Evolución
            </button>
            {currentVisit.visit_status === 'discharge' && (
              <button
                onClick={() => setActiveTab('discharge')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'discharge'
                    ? 'border-hospital-blue text-hospital-blue'
                    : 'border-transparent text-gray-900 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ClockIcon className="h-4 w-4 inline mr-2" />
                Alta
              </button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'admission' && (
            <div className="space-y-6">
              {/* Información Básica */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h4 className="text-sm font-bold text-black uppercase tracking-wide mb-4">
                  Información Básica
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Motivo</label>
                    {isEditing ? (
                      <textarea
                        value={currentVisit.reason}
                        onChange={(e) => setEditedVisit(prev => prev ? { ...prev, reason: e.target.value } : null)}
                        rows={2}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#4fbbeb] focus:border-[#4fbbeb] text-sm resize-none"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300">
                        {currentVisit.reason}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Lugar de la atención</label>
                    <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300">
                      {attentionPlaces.find(place => place.value === currentVisit.attention_place)?.label || 'No registrado'} {currentVisit.attention_details ? `- ${currentVisit.attention_details}` : ''}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Ubicación</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={currentVisit.location}
                        onChange={(e) => setEditedVisit(prev => prev ? { ...prev, location: e.target.value } : null)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#4fbbeb] focus:border-[#4fbbeb] text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300">
                        {currentVisit.location}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Fecha de Ingreso</label>
                    <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300">
                      {formatDate(currentVisit.date_of_admission)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Signos Vitales */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h4 className="text-sm font-bold text-black uppercase tracking-wide mb-4">
                  Signos Vitales al Ingreso
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Frecuencia Cardíaca</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={currentVisit.admission_heart_rate || ''}
                        onChange={(e) => setEditedVisit(prev => prev ? { ...prev, admission_heart_rate: e.target.value ? parseInt(e.target.value) : null } : null)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#4fbbeb] focus:border-[#4fbbeb] text-sm"
                        placeholder="BPM"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300">
                        {currentVisit.admission_heart_rate ? `${currentVisit.admission_heart_rate} BPM` : 'No registrado'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Presión Arterial</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={currentVisit.admission_blood_pressure || ''}
                        onChange={(e) => setEditedVisit(prev => prev ? { ...prev, admission_blood_pressure: e.target.value ? parseInt(e.target.value) : null } : null)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#4fbbeb] focus:border-[#4fbbeb] text-sm"
                        placeholder="mmHg"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300">
                        {currentVisit.admission_blood_pressure ? `${currentVisit.admission_blood_pressure} mmHg` : 'No registrado'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Temperatura</label>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.1"
                        value={currentVisit.admission_temperature || ''}
                        onChange={(e) => setEditedVisit(prev => prev ? { ...prev, admission_temperature: e.target.value ? parseFloat(e.target.value) : null } : null)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#4fbbeb] focus:border-[#4fbbeb] text-sm"
                        placeholder="°C"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300">
                        {currentVisit.admission_temperature ? `${currentVisit.admission_temperature}°C` : 'No registrado'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Saturación O2</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={currentVisit.admission_oxygen_saturation || ''}
                        onChange={(e) => setEditedVisit(prev => prev ? { ...prev, admission_oxygen_saturation: e.target.value ? parseInt(e.target.value) : null } : null)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#4fbbeb] focus:border-[#4fbbeb] text-sm"
                        placeholder="%"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300">
                        {currentVisit.admission_oxygen_saturation ? `${currentVisit.admission_oxygen_saturation}%` : 'No registrado'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'medical' && (
            <div className="space-y-6">
              
              {/* Exámenes */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h4 className="text-sm font-bold text-black uppercase tracking-wide mb-4">
                  Pruebas Realizadas
                </h4>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Pruebas</label>
                  {isEditing ? (
                    <textarea
                      value={currentVisit.tests || ''}
                      onChange={(e) => setEditedVisit(prev => prev ? { ...prev, tests: e.target.value } : null)}
                      rows={3}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#4fbbeb] focus:border-[#4fbbeb] text-sm resize-none"
                      placeholder="Ingrese los exámenes solicitados..."
                    />
                  ) : (
                    <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300 min-h-[60px] whitespace-pre-wrap">
                      {currentVisit.tests || 'No especificado'}
                    </p>
                  )}
                </div>
              </div>
              {/* Diagnóstico */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h4 className="text-sm font-bold text-black uppercase tracking-wide mb-4">
                  Diagnóstico y Tratamiento
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Diagnóstico</label>
                    {isEditing ? (
                      <textarea
                        value={currentVisit.diagnosis || ''}
                        onChange={(e) => setEditedVisit(prev => prev ? { ...prev, diagnosis: e.target.value } : null)}
                        rows={3}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#4fbbeb] focus:border-[#4fbbeb] text-sm resize-none"
                        placeholder="Ingrese el diagnóstico..."
                      />
                    ) : (
                      <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300 min-h-[60px] whitespace-pre-wrap">
                        {currentVisit.diagnosis || 'No especificado'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tratamiento</label>
                    {isEditing ? (
                      <textarea
                        value={currentVisit.treatment || ''}
                        onChange={(e) => setEditedVisit(prev => prev ? { ...prev, treatment: e.target.value } : null)}
                        rows={3}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#4fbbeb] focus:border-[#4fbbeb] text-sm resize-none"
                        placeholder="Ingrese el tratamiento..."
                      />
                    ) : (
                      <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300 min-h-[60px] whitespace-pre-wrap">
                        {currentVisit.treatment || 'No especificado'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Medicación</label>
                    {isEditing ? (
                      <textarea
                        value={currentVisit.medication || ''}
                        onChange={(e) => setEditedVisit(prev => prev ? { ...prev, medication: e.target.value } : null)}
                        rows={3}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#4fbbeb] focus:border-[#4fbbeb] text-sm resize-none"
                        placeholder="Ingrese la medicación..."
                      />
                    ) : (
                      <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300 min-h-[60px] whitespace-pre-wrap">
                        {currentVisit.medication || 'No especificado'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'evolution' && (
            <div className="space-y-6">
              {/* Evolución */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h4 className="text-sm font-bold text-black uppercase tracking-wide mb-4">
                  Evolución del Paciente
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Evolución</label>
                    {isEditing ? (
                      <textarea
                        value={currentVisit.evolution || ''}
                        onChange={(e) => setEditedVisit(prev => prev ? { ...prev, evolution: e.target.value } : null)}
                        rows={4}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#4fbbeb] focus:border-[#4fbbeb] text-sm resize-none"
                        placeholder="Describa la evolución del paciente..."
                      />
                    ) : (
                      <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300 min-h-[80px] whitespace-pre-wrap">
                        {currentVisit.evolution || 'No especificado'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Observaciones Adicionales</label>
                    {isEditing ? (
                      <textarea
                        value={currentVisit.additional_observations || ''}
                        onChange={(e) => setEditedVisit(prev => prev ? { ...prev, additional_observations: e.target.value } : null)}
                        rows={3}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#4fbbeb] focus:border-[#4fbbeb] text-sm resize-none"
                        placeholder="Ingrese observaciones adicionales..."
                      />
                    ) : (
                      <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300 min-h-[60px] whitespace-pre-wrap">
                        {currentVisit.additional_observations || 'No especificado'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'discharge' && (
            <div className="space-y-6">
              {/* Alta */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h4 className="text-sm font-bold text-black uppercase tracking-wide mb-4">
                  Información de Alta
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Fecha de Alta</label>
                    <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300">
                      {formatDate(currentVisit.date_of_discharge)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Recomendaciones</label>
                    {isEditing ? (
                      <textarea
                        value={currentVisit.recommendations || ''}
                        onChange={(e) => setEditedVisit(prev => prev ? { ...prev, recommendations: e.target.value } : null)}
                        rows={3}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#4fbbeb] focus:border-[#4fbbeb] text-sm resize-none"
                        placeholder="Ingrese las recomendaciones..."
                      />
                    ) : (
                      <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300 min-h-[60px] whitespace-pre-wrap">
                        {currentVisit.recommendations || 'No especificado'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Seguimiento Especialista</label>
                    {isEditing ? (
                      <textarea
                        value={currentVisit.specialist_follow_up || ''}
                        onChange={(e) => setEditedVisit(prev => prev ? { ...prev, specialist_follow_up: e.target.value } : null)}
                        rows={2}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#4fbbeb] focus:border-[#4fbbeb] text-sm resize-none"
                        placeholder="Ingrese el seguimiento con especialista..."
                      />
                    ) : (
                      <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300 min-h-[40px] whitespace-pre-wrap">
                        {currentVisit.specialist_follow_up || 'No especificado'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Notas</label>
                    {isEditing ? (
                      <textarea
                        value={currentVisit.notes || ''}
                        onChange={(e) => setEditedVisit(prev => prev ? { ...prev, notes: e.target.value } : null)}
                        rows={3}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#4fbbeb] focus:border-[#4fbbeb] text-sm resize-none"
                        placeholder="Ingrese notas adicionales..."
                      />
                    ) : (
                      <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300 min-h-[60px] whitespace-pre-wrap">
                        {currentVisit.notes || 'No especificado'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg border-t border-gray-200">
          {isEditing ? (
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
    </div>
  )
} 