import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

class AuthService {
  constructor() {
    this.currentUser = null
    this.session = null
    this.authListeners = new Set()
  }

  // Initialize auth state
  async initialize() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error

      this.session = session
      this.currentUser = session?.user || null

      // Listen for auth changes
      supabase.auth.onAuthStateChange((event, session) => {
        this.session = session
        this.currentUser = session?.user || null
        
        // Notify listeners
        this.authListeners.forEach(callback => {
          callback({ event, session, user: this.currentUser })
        })
      })

      return this.currentUser
    } catch (error) {
      console.error('Error initializing auth:', error)
      return null
    }
  }

  // Subscribe to auth state changes
  onAuthStateChange(callback) {
    this.authListeners.add(callback)
    
    // Return unsubscribe function
    return () => {
      this.authListeners.delete(callback)
    }
  }

  // Sign up with email/password
  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData // Additional user metadata
        }
      })

      if (error) throw error

      // Create user profile in your backend
      if (data.user) {
        await this.createUserProfile(data.user)
      }

      return { user: data.user, session: data.session }
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  // Sign in with email/password
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // Update last login in your backend
      if (data.user) {
        await this.updateLastLogin(data.user.id)
      }

      return { user: data.user, session: data.session }
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Google sign in error:', error)
      throw error
    }
  }

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      this.currentUser = null
      this.session = null
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Reset password error:', error)
      throw error
    }
  }

  // Update password
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Update password error:', error)
      throw error
    }
  }

  // Get auth token for API calls
  async getAuthToken() {
    try {
      if (!this.session) {
        const { data: { session } } = await supabase.auth.getSession()
        this.session = session
      }
      
      return this.session?.access_token || null
    } catch (error) {
      console.error('Error getting auth token:', error)
      return null
    }
  }

  // Create user profile in your backend
  async createUserProfile(supabaseUser) {
    try {
      const token = await this.getAuthToken()
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/create-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          supabase_id: supabaseUser.id,
          email: supabaseUser.email,
          full_name: supabaseUser.user_metadata?.full_name || supabaseUser.email,
          avatar_url: supabaseUser.user_metadata?.avatar_url
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create user profile')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating user profile:', error)
      throw error
    }
  }

  // Update last login
  async updateLastLogin(userId) {
    try {
      const token = await this.getAuthToken()
      
      await fetch(`${process.env.REACT_APP_API_URL}/auth/update-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ supabase_id: userId })
      })
    } catch (error) {
      console.error('Error updating last login:', error)
      // Don't throw - this is non-critical
    }
  }

  // Get user profile from your backend
  async getUserProfile() {
    try {
      const token = await this.getAuthToken()
      if (!token) return null

      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user profile')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.currentUser && !!this.session
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser
  }

  // Get current session
  getCurrentSession() {
    return this.session
  }
}

// Create singleton instance
const authService = new AuthService()
export default authService
