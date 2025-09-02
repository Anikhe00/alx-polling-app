import { useState, useEffect } from 'react'
import { User } from '@/lib/types'
import { loginUser, registerUser, logoutUser, getCurrentUser, isAuthenticated } from '@/lib/auth/auth-utils'
import { supabase } from '@/lib/supabase/client'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = async () => {
      try {
        const isUserAuthenticated = await isAuthenticated()
        if (isUserAuthenticated) {
          const currentUser = await getCurrentUser()
          setUser(currentUser)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setLoading(true)
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          const currentUser = await getCurrentUser()
          setUser(currentUser)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
        setLoading(false)
      }
    )

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const result = await loginUser({ email, password })
      
      if (result.success && result.user) {
        setUser(result.user)
        return { success: true }
      } else {
        return { success: false, error: result.error || 'Login failed' }
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
      
      if (result.success && result.user) {
        setUser(result.user)
        return { success: true }
      } else {
        return { success: false, error: result.error || 'Registration failed' }
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
        return { success: false, error: result.error || 'Logout failed' }
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
