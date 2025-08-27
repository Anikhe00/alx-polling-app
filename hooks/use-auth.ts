import { useState, useEffect } from 'react'
import { User } from '@/lib/types'
import { loginUser, registerUser, logoutUser, getCurrentUser, isAuthenticated } from '@/lib/auth/auth-utils'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = async () => {
      try {
        if (isAuthenticated()) {
          const currentUser = getCurrentUser()
          setUser(currentUser)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const result = await loginUser({ email, password })
      
      if (result.success) {
        setUser(result.user)
        return { success: true }
      } else {
        return { success: false, error: 'Login failed' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Login failed' }
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true)
      const result = await registerUser({ email, password, name })
      
      if (result.success) {
        setUser(result.user)
        return { success: true }
      } else {
        return { success: false, error: 'Registration failed' }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Registration failed' }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      const result = await logoutUser()
      
      if (result.success) {
        setUser(null)
        return { success: true }
      } else {
        return { success: false, error: 'Logout failed' }
      }
    } catch (error) {
      console.error('Logout error:', error)
      return { success: false, error: 'Logout failed' }
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  }
}
