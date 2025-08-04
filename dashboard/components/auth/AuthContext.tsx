'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  decodeJWT, 
  isTokenExpired, 
  extractUserFromToken, 
  shouldRefreshToken 
} from '@/lib/jwt'

interface User {
  id: string
  name: string
  email: string
  type: string
  verification_status?: string
  status?: string
  project?: string
  previlage?: string
  satellites?: string[]
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (token: string, refreshToken: string) => void
  logout: () => void
  isAuthenticated: boolean
  refreshToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

  // Function to refresh the access token
  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    if (!refreshToken || isRefreshing) return false
    
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const data = await response.json()
      const newToken = data.access_token
      
      if (newToken) {
        setToken(newToken)
        localStorage.setItem('token', newToken)
        document.cookie = `token=${newToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
        
        // Update user from new token
        const userData = extractUserFromToken(newToken)
        if (userData) {
          setUser(userData)
        }
        
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error refreshing token:', error)
      return false
    } finally {
      setIsRefreshing(false)
    }
  }, [refreshToken, isRefreshing])

  // Function to validate and potentially refresh token
  const validateToken = useCallback(async (currentToken: string): Promise<boolean> => {
    if (isTokenExpired(currentToken)) {
      console.log('Token is expired, attempting refresh...')
      return await refreshAccessToken()
    }
    
    if (shouldRefreshToken(currentToken)) {
      console.log('Token will expire soon, refreshing...')
      return await refreshAccessToken()
    }
    
    return true
  }, [refreshAccessToken])

  useEffect(() => {
    // Check for existing token on app load
    const checkAuth = async () => {
      try {
        // Check both localStorage and cookies for tokens
        const storedToken = localStorage.getItem('token')
        const storedRefreshToken = localStorage.getItem('refresh_token')
        
        const cookieToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1]
        
        const cookieRefreshToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('refresh_token='))
          ?.split('=')[1]

        const currentToken = storedToken || cookieToken
        const currentRefreshToken = storedRefreshToken || cookieRefreshToken
        
        if (currentToken && currentRefreshToken) {
          setRefreshToken(currentRefreshToken)
          
          // Validate and potentially refresh the token
          const isValid = await validateToken(currentToken)
          
          if (isValid) {
            setToken(currentToken)
            const userData = extractUserFromToken(currentToken)
            if (userData) {
              setUser(userData)
            }
          } else {
            // Token is invalid and refresh failed, clear everything
            logout()
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
        logout()
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [validateToken])

  // Set up periodic token validation
  useEffect(() => {
    if (!token) return

    const interval = setInterval(async () => {
      if (token && shouldRefreshToken(token)) {
        console.log('Periodic token refresh check...')
        const success = await refreshAccessToken()
        if (!success) {
          logout()
        }
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [token, refreshAccessToken])

  const login = (newToken: string, newRefreshToken: string) => {
    setToken(newToken)
    setRefreshToken(newRefreshToken)
    
    // Store in both localStorage and cookies for compatibility
    localStorage.setItem('token', newToken)
    localStorage.setItem('refresh_token', newRefreshToken)
    
    // Set cookie with httpOnly: false so client can access it
    document.cookie = `token=${newToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
    document.cookie = `refresh_token=${newRefreshToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
    
    // Extract user info from token
    const userData = extractUserFromToken(newToken)
    if (userData) {
      setUser(userData)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setRefreshToken(null)
    
    // Clear from localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    
    // Clear cookies
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    
    router.push('/auth/login')
  }

  const isAuthenticated = !!token && !isTokenExpired(token)

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading: isLoading || isRefreshing,
        login,
        logout,
        isAuthenticated,
        refreshToken: refreshAccessToken,
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