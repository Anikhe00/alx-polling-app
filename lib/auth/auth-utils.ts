import { AuthFormData } from '@/lib/types'
import { supabase } from '@/lib/supabase/client'

export async function loginUser(data: AuthFormData) {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    })

    if (error) {
      console.error('Login error:', error.message)
      return {
        success: false,
        error: error.message
      }
    }

    // Try to get user profile data
    let profileData = null;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user?.id)
        .single()
      profileData = data;
    } catch (error) {
      console.error('Error fetching profile data:', error)
      // Continue without profile data
    }

    return {
      success: true,
      user: {
        id: authData.user?.id || '',
        email: authData.user?.email || '',
        name: profileData?.name || authData.user?.email?.split('@')[0] || '',
        avatar: profileData?.avatar_url || '',
        createdAt: new Date(authData.user?.created_at || ''),
        updatedAt: new Date()
      }
    }
  } catch (error) {
    console.error('Unexpected login error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred during login'
    }
  }
}

export async function registerUser(data: AuthFormData) {
  try {
    // Register the user with Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name || ''
        }
      }
    })

    if (signUpError) {
      console.error('Registration error:', signUpError.message)
      return {
        success: false,
        error: signUpError.message
      }
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'User registration failed'
      }
    }

    // Try to create a profile record in the profiles table
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            name: data.name || authData.user.email?.split('@')[0] || '',
            email: authData.user.email
          }
        ])

      if (profileError) {
        console.error('Profile creation error:', profileError.message)
        // We don't return an error here as the auth was successful
        // The profile can be created later
      }
    } catch (error) {
      // If the profiles table doesn't exist or any other error occurs,
      // log it but continue with the authentication flow
      console.error('Profile creation error:', error)
      // We'll handle profile creation later when the table exists
    }
    
    // Sign in the user immediately after registration
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    })
    
    if (signInError) {
      console.error('Auto sign-in error:', signInError.message)
      // We still return success as registration was successful
      // The user can manually sign in
    }

    return {
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email || '',
        name: data.name || authData.user.email?.split('@')[0] || '',
        avatar: '',
        createdAt: new Date(authData.user.created_at || ''),
        updatedAt: new Date()
      }
    }
  } catch (error) {
    console.error('Unexpected registration error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred during registration'
    }
  }
}

export async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Logout error:', error.message)
      return {
        success: false,
        error: error.message
      }
    }
    
    return {
      success: true
    }
  } catch (error) {
    console.error('Unexpected logout error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred during logout'
    }
  }
}

export async function getCurrentUser() {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      console.error('Session error:', sessionError?.message || 'No active session')
      return null
    }
    
    const { data: userData, error: userError } = await supabase.auth.getUser()
    
    if (userError || !userData.user) {
      console.error('User error:', userError?.message || 'User not found')
      return null
    }
    
    // Try to get profile data
    let profileData = null;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single()
      profileData = data;
    } catch (error) {
      console.error('Error fetching profile data:', error)
      // Continue without profile data
    }
    
    return {
      id: userData.user.id,
      email: userData.user.email || '',
      name: profileData?.name || userData.user.email?.split('@')[0] || '',
      avatar: profileData?.avatar_url || '',
      createdAt: new Date(userData.user.created_at || ''),
      updatedAt: new Date()
    }
  } catch (error) {
    console.error('Unexpected error getting current user:', error)
    return null
  }
}

export async function isAuthenticated() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return !!session
  } catch (error) {
    console.error('Authentication check error:', error)
    return false
  }
}
