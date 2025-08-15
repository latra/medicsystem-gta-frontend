'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../firebase/config'
import { getCurrentDoctor, Doctor } from '../../lib/api'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  doctor: Doctor | null
  loading: boolean
  logout: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get doctor data from API
          const doctorData = await getCurrentDoctor()
          setDoctor(doctorData)
        } catch (error: any) {
          console.error('Error fetching doctor data:', error)
          
          if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
            console.error('Authentication failed for doctor data. User may need to re-authenticate.')
          }
          
          setDoctor(null)
        }
      } else {
        setDoctor(null)
      }
      
      setTimeout(() => {
        setUser(user)
        setLoading(false)
      }, 500)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password).then(() => {
        router.push('/')
      });
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };
  const logout = async () => {
    try {
      await signOut(auth)
      setDoctor(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const value = {
    user,
    doctor,
    loading,
    logout,
    signIn,
    signUp
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 