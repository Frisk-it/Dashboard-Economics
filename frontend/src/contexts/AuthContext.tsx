import React, { createContext, useContext, useEffect, useState } from 'react'
import apiService from '@/lib/api'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
  }) => Promise<void>
  logout: () => void
  updateProfile: (profileData: { firstName?: string; lastName?: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token')
      const storedUser = localStorage.getItem('user')

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser))
          // Optionally verify token with backend
          await apiService.getProfile()
        } catch (error) {
          console.error('Token verification failed:', error)
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login({ email, password })
      const { token, user: userData } = response

      localStorage.setItem('auth_token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const register = async (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
  }) => {
    try {
      const response = await apiService.register(userData)
      const { token, user: newUser } = response

      localStorage.setItem('auth_token', token)
      localStorage.setItem('user', JSON.stringify(newUser))
      setUser(newUser)
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const updateProfile = async (profileData: { firstName?: string; lastName?: string }) => {
    try {
      const response = await apiService.updateProfile(profileData)
      const updatedUser = response.user

      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
    } catch (error) {
      console.error('Profile update failed:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}