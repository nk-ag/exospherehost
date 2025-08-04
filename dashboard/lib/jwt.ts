// JWT utility functions for token management

interface JWTPayload {
  user_id: string
  user_name: string
  user_type: string
  verification_status: string
  status: string
  project?: string
  previlage?: string
  satellites?: string[]
  exp: number
  token_type: string
}

export function decodeJWT(token: string): JWTPayload | null {
  try {
    // JWT tokens are in format: header.payload.signature
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token)
  if (!payload) return true
  
  const currentTime = Math.floor(Date.now() / 1000)
  return payload.exp < currentTime
}

export function getTokenExpiryTime(token: string): number | null {
  const payload = decodeJWT(token)
  return payload?.exp || null
}

export function getTimeUntilExpiry(token: string): number {
  const payload = decodeJWT(token)
  if (!payload) return 0
  
  const currentTime = Math.floor(Date.now() / 1000)
  return Math.max(0, payload.exp - currentTime)
}

export function extractUserFromToken(token: string) {
  const payload = decodeJWT(token)
  if (!payload) return null
  
  return {
    id: payload.user_id,
    name: payload.user_name,
    email: payload.user_id, // Assuming user_id is email
    type: payload.user_type,
    verification_status: payload.verification_status,
    status: payload.status,
    project: payload.project,
    previlage: payload.previlage,
    satellites: payload.satellites
  }
}

export function shouldRefreshToken(token: string, bufferMinutes: number = 5): boolean {
  const payload = decodeJWT(token)
  if (!payload) return true
  
  const currentTime = Math.floor(Date.now() / 1000)
  const bufferSeconds = bufferMinutes * 60
  return (payload.exp - currentTime) <= bufferSeconds
} 