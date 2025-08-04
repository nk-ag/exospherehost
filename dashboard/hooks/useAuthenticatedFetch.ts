import { useCallback } from 'react'
import { useAuth } from '@/components/auth/AuthContext'

interface AuthenticatedFetchOptions extends RequestInit {
  skipAuth?: boolean
}

export function useAuthenticatedFetch() {
  const { token, refreshToken, logout } = useAuth()

  const authenticatedFetch = useCallback(
    async (url: string, options: AuthenticatedFetchOptions = {}) => {
      const { skipAuth = false, ...fetchOptions } = options

      // If skipAuth is true, make a regular fetch
      if (skipAuth) {
        return fetch(url, fetchOptions)
      }

      // If no token, redirect to login
      if (!token) {
        logout()
        throw new Error('No authentication token available')
      }

      // Add authorization header
      const headers = {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
        Authorization: `Bearer ${token}`,
      }

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          headers,
        })

        // If response is 401 (Unauthorized), try to refresh token
        if (response.status === 401) {
          console.log('Token expired, attempting refresh...')
          const refreshSuccess = await refreshToken()
          
          if (refreshSuccess) {
            // Retry the request with new token
            const newToken = localStorage.getItem('token')
            if (newToken) {
              const retryResponse = await fetch(url, {
                ...fetchOptions,
                headers: {
                  ...headers,
                  Authorization: `Bearer ${newToken}`,
                },
              })
              return retryResponse
            }
          } else {
            // Refresh failed, logout user
            logout()
            throw new Error('Authentication failed')
          }
        }

        return response
      } catch (error) {
        console.error('Authenticated fetch error:', error)
        throw error
      }
    },
    [token, refreshToken, logout]
  )

  return authenticatedFetch
} 