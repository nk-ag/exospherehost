// API utility functions with automatic token refresh

interface ApiResponse<T = any> {
  data?: T
  error?: string
  status: number
}

export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('token')
    
    if (!token) {
      return {
        error: 'No authentication token available',
        status: 401
      }
    }

    // Add authorization header
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      Authorization: `Bearer ${token}`,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    // If response is 401, try to refresh token
    if (response.status === 401) {
      console.log('Token expired, attempting refresh...')
      
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        return {
          error: 'No refresh token available',
          status: 401
        }
      }

      // Try to refresh the token
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      })

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json()
        const newToken = refreshData.access_token
        
        if (newToken) {
          // Update stored token
          localStorage.setItem('token', newToken)
          
          // Retry the original request with new token
          const retryResponse = await fetch(url, {
            ...options,
            headers: {
              ...headers,
              Authorization: `Bearer ${newToken}`,
            },
          })

          if (retryResponse.ok) {
            const data = await retryResponse.json()
            return {
              data,
              status: retryResponse.status
            }
          } else {
            return {
              error: `Request failed after token refresh: ${retryResponse.statusText}`,
              status: retryResponse.status
            }
          }
        }
      }

      // Refresh failed, clear tokens and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('refresh_token')
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      
      // Redirect to login
      window.location.href = '/auth/login'
      
      return {
        error: 'Authentication failed',
        status: 401
      }
    }

    if (response.ok) {
      const data = await response.json()
      return {
        data,
        status: response.status
      }
    } else {
      return {
        error: `Request failed: ${response.statusText}`,
        status: response.status
      }
    }
  } catch (error) {
    console.error('API request error:', error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 500
    }
  }
}

// Helper function for GET requests
export async function apiGet<T = any>(url: string): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { method: 'GET' })
}

// Helper function for POST requests
export async function apiPost<T = any>(url: string, data: any): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Helper function for PUT requests
export async function apiPut<T = any>(url: string, data: any): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

// Helper function for DELETE requests
export async function apiDelete<T = any>(url: string): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { method: 'DELETE' })
} 