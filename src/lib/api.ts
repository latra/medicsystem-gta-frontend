import { auth } from '../app/firebase/config'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function getAuthToken(): Promise<string | null> {
  // Wait for auth to be initialized
  let attempts = 0
  const maxAttempts = 10
  
  while (attempts < maxAttempts) {
    const user = auth.currentUser
    if (user) {
      try {
        const token = await user.getIdToken()
        console.log('Auth token obtained successfully')
        return token
      } catch (error) {
        console.error('Error getting auth token:', error)
        return null
      }
    }
    
    // Wait a bit before trying again
    await new Promise(resolve => setTimeout(resolve, 100))
    attempts++
  }
  
  console.warn('No user found after waiting for auth to initialize')
  return null
}

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  
  if (token) {
    headers.Authorization = `Bearer ${token}`
    console.log(`API call to ${endpoint} with auth token`)
  } else {
    console.warn(`No authentication token available for API call to: ${endpoint}`)
  }
  
  const url = `${API_BASE_URL}${endpoint}`
  console.log('Making API call to:', url, 'with token:', token ? 'Present' : 'Missing')
  
  const response = await fetch(url, {
    ...options,
    headers,
  })
  
  if (!response.ok) {
    const errorMessage = `API call failed: ${response.status} ${response.statusText}`
    console.error(errorMessage, 'for endpoint:', endpoint)
    
    // Try to get more details from response
    try {
      const errorData = await response.text()
      console.error('Error response body:', errorData)
    } catch (e) {
      console.error('Could not read error response body')
    }
    
    throw new Error(errorMessage)
  }
  
  return response.json()
}

// API functions for doctor data
export interface Doctor {
  name: string
  dni: string
  email: string
  enabled: boolean
  is_admin?: boolean | null
}

export async function getCurrentDoctor(): Promise<Doctor> {
  return apiCall<Doctor>('/doctor/me')
}

// API functions for patients
export interface Patient {
  name: string
  dni: string
  age: number
  sex: 'male' | 'female'
  phone: string
  blood_type: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
  allergies: string
  medical_notes: string
  notes: string
}

export async function getPatients(): Promise<Patient[]> {
  return apiCall<Patient[]>('/patients/')
}

export async function deletePatient(dni: string): Promise<void> {
  return apiCall<void>(`/patients/${dni}`, {
    method: 'DELETE'
  })
}

export async function createPatient(patientData: Omit<Patient, 'phone' | 'allergies' | 'medical_notes' | 'notes'> & {
  phone?: string
  allergies?: string
  medical_notes?: string
  notes?: string
}): Promise<Patient> {
  // Ensure optional fields are sent as empty strings if not provided
  const dataToSend = {
    ...patientData,
    phone: patientData.phone || '',
    allergies: patientData.allergies || '',
    medical_notes: patientData.medical_notes || '',
    notes: patientData.notes || ''
  }
  
  return apiCall<Patient>('/patients/', {
    method: 'POST',
    body: JSON.stringify(dataToSend)
  })
}

// API functions for patient visits
export interface PatientVisit {
  visit_id: string
  visit_status: 'admission' | 'discharge' | 'pending'
  doctor_dni: string
  date_of_admission: string
  date_of_discharge: string
  reason: string
  attention_type: 'street' | 'emergency' | 'consultation'
  location: string
  doctor_name: string
}

export interface VisitDetails {
  visit_id: string
  visit_status: 'admission' | 'discharge' | 'pending'
  patient_dni: string
  reason: string
  attention_place: 'street' | 'hospital' | 'traslad' | 'other' | 'headquarters' | 'home' | 'other'
  attention_details: string
  location: string
  date_of_admission: string | null
  admission_status: 'conscious' | 'unconscious' | 'in_danger' | 'stable' | 'critical' | null
  admission_heart_rate: number | null
  admission_blood_pressure: number | null
  admission_temperature: number | null
  admission_oxygen_saturation: number | null
  triage: 'unknown' | 'green' | 'yellow' | 'red' | 'black' | null
  doctor_dni: string
  diagnosis: string | null
  tests: string | null
  treatment: string | null
  evolution: string | null
  recommendations: string | null
  medication: string | null
  date_of_discharge: string | null
  specialist_follow_up: string | null
  additional_observations: string | null
  notes: string | null
}

export interface CreateVisitData {
  patient_dni: string
  reason: string
  attention_place: 'street' | 'hospital' | 'traslad' | 'other' | 'headquarters' | 'home'
  attention_details: string
  location: string
  admission_status?: 'conscious' | 'unconscious' | 'in_danger' | 'stable' | 'critical'
  admission_heart_rate?: number
  admission_blood_pressure?: number
  admission_temperature?: number
  admission_oxygen_saturation?: number
  triage?: 'unknown' | 'green' | 'yellow' | 'red' | 'black'
}

export async function getPatientVisits(patientDni: string): Promise<PatientVisit[]> {
  return apiCall<PatientVisit[]>(`/visit/${patientDni}`)
}

export async function getVisitDetails(visitId: string): Promise<VisitDetails> {
  return apiCall<VisitDetails>(`/visit/info/${visitId}`)
}

export async function updateVisit(visitId: string, visitData: Partial<VisitDetails>): Promise<VisitDetails> {
  return apiCall<VisitDetails>(`/visit/${visitId}`, {
    method: 'PUT',
    body: JSON.stringify(visitData)
  })
}

export async function createVisit(visitData: CreateVisitData): Promise<VisitDetails> {
  return apiCall<VisitDetails>('/visit/', {
    method: 'POST',
    body: JSON.stringify(visitData)
  })
}

export async function dischargeVisit(visitId: string): Promise<void> {
  return apiCall<void>(`/visit/${visitId}/discharge`, {
    method: 'PUT'
  })
}

// API functions for admitted patients
export interface PatientAdmitted {
  name: string
  dni: string
  visit_id: string
  reason: string
  attention_place: 'street' | 'hospital' | 'traslad' | 'other' | 'headquarters' | 'home' | 'other'
  attention_details: string
  triage: 'unknown' | 'green' | 'yellow' | 'red' | 'black'
  doctor_name: string
  doctor_dni: string
}

export async function getAdmittedPatients(): Promise<PatientAdmitted[]> {
  return apiCall<PatientAdmitted[]>('/patients/admitted')
} 