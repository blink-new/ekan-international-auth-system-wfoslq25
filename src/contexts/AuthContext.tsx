import React, { useState, useEffect, useCallback } from 'react'
import { blink } from '@/blink/client'
import { User, UserRole, ROLE_PERMISSIONS, AuthContextType } from '@/types/auth'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchingUser, setFetchingUser] = useState(false)

  const fetchUserDetails = useCallback(async (blinkUser: any) => {
    try {
      console.log('Fetching user details for:', blinkUser.email)
      
      // Check if this is the admin email first to avoid database queries
      if (blinkUser.email === 'ekanintl007@gmail.com') {
        console.log('Admin user authenticated, setting admin profile...')
        
        setUser({
          id: 'user_1753284157172', // Use the existing ID from database
          email: 'ekanintl007@gmail.com',
          firstName: 'EKAN',
          lastName: 'Admin',
          role: 'admin',
          status: 'active',
          department: 'Administration',
          position: 'System Administrator',
          phone: '',
          avatarUrl: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          approvedBy: 'system',
          approvedAt: new Date().toISOString(),
          userId: blinkUser.id || ''
        })
        return
      }

      // For other users, try to fetch from database
      try {
        const users = await blink.db.users.list({
          where: { email: blinkUser.email },
          limit: 1
        })

        console.log('Database query result:', users)
        
        // Ensure users is an array and has elements
        const usersArray = Array.isArray(users) ? users : []
        if (usersArray.length > 0) {
          const userData = usersArray[0]
          console.log('Found existing user:', userData.email, 'Role:', userData.role)
          
          setUser({
            id: userData.id || '',
            email: userData.email || '',
            firstName: userData.firstName || userData.first_name || '',
            lastName: userData.lastName || userData.last_name || '',
            role: (userData.role as UserRole) || 'member',
            status: userData.status || 'pending',
            department: userData.department || '',
            position: userData.position || '',
            phone: userData.phone || '',
            avatarUrl: userData.avatarUrl || userData.avatar_url || '',
            createdAt: userData.createdAt || userData.created_at || new Date().toISOString(),
            updatedAt: userData.updatedAt || userData.updated_at || new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            approvedBy: userData.approvedBy || userData.approved_by || '',
            approvedAt: userData.approvedAt || userData.approved_at || '',
            userId: blinkUser.id || ''
          })
        } else {
          // User not found in our system
          console.log('User not found in system:', blinkUser.email)
          setUser(null)
        }
      } catch (dbError) {
        console.warn('Database query failed:', dbError)
        // For non-admin users, if DB query fails, they need to request access
        setUser(null)
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    console.log('Setting up auth state listener...')
    
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      console.log('Auth state changed:', {
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        userEmail: state.user?.email
      })

      try {
        if (state.isAuthenticated && state.user) {
          // Fetch user details from our database
          fetchUserDetails(state.user).catch((error) => {
            console.error('Error fetching user details:', error)
            setUser(null)
            setLoading(false)
          })
        } else if (!state.isLoading) {
          setUser(null)
          setLoading(false)
        }
        
        if (state.isLoading !== undefined) {
          setLoading(state.isLoading)
        }
      } catch (error) {
        console.error('Auth state change error:', error)
        setUser(null)
        setLoading(false)
      }
    })

    return unsubscribe
  }, [fetchUserDetails])

  const login = async () => {
    try {
      console.log('Initiating login...')
      // Blink handles authentication automatically with authRequired: true
      // No need to call login() manually
    } catch (error) {
      console.error('Login error:', error)
      throw new Error('Login failed')
    }
  }

  const logout = () => {
    console.log('Logging out...')
    blink.auth.logout()
    setUser(null)
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    const permissions = ROLE_PERMISSIONS[user.role] || []
    return permissions.includes(permission)
  }

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false
    return roles.includes(user.role)
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    hasPermission,
    hasRole
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}