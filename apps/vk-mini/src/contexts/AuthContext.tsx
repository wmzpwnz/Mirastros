'use client'

/**
 * Authentication context for VK Mini App
 */
import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  authenticateWithVK,
  getStoredAuth,
  clearAuth,
  AuthResponse,
} from '../lib/auth'

interface AuthContextType {
  auth: AuthResponse | null
  isLoading: boolean
  isAuthenticated: boolean
  login: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored authentication on mount
    const storedAuth = getStoredAuth()
    if (storedAuth) {
      setAuth(storedAuth)
      setIsLoading(false)
    } else {
      // Attempt automatic authentication with VK
      login()
    }
  }, [])

  const login = async () => {
    setIsLoading(true)
    try {
      const authData = await authenticateWithVK()
      if (authData) {
        setAuth(authData)
      }
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    clearAuth()
    setAuth(null)
  }

  return (
    <AuthContext.Provider
      value={{
        auth,
        isLoading,
        isAuthenticated: auth !== null,
        login,
        logout,
      }}
    >
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
