'use client'

import { useAuth } from '@/components/auth/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  getTimeUntilExpiry, 
  getTokenExpiryTime, 
  isTokenExpired, 
  shouldRefreshToken 
} from '@/lib/jwt'
import { useState, useEffect } from 'react'

export function TokenInfo() {
  const { token, user, refreshToken: refreshTokenFn } = useAuth()
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number>(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (!token) return

    const updateTime = () => {
      const timeLeft = getTimeUntilExpiry(token)
      setTimeUntilExpiry(timeLeft)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [token])

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Token Information</CardTitle>
          <CardDescription>No token available</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const expiryTime = getTokenExpiryTime(token)
  const expired = isTokenExpired(token)
  const shouldRefresh = shouldRefreshToken(token)
  const expiryDate = expiryTime ? new Date(expiryTime * 1000) : null

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshTokenFn()
    } catch (error) {
      console.error('Failed to refresh token:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Token Information</CardTitle>
        <CardDescription>JWT token details and expiry</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            <Badge variant={expired ? "destructive" : shouldRefresh ? "secondary" : "default"}>
              {expired ? "Expired" : shouldRefresh ? "Expiring Soon" : "Valid"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Time Remaining:</span>
            <span className="text-sm font-mono">
              {formatTime(timeUntilExpiry)}
            </span>
          </div>
          
          {expiryDate && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Expires At:</span>
              <span className="text-sm">
                {expiryDate.toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>

        {user && (
          <div className="space-y-2">
            <div className="text-sm font-medium">User Information:</div>
            <div className="text-sm space-y-1">
              <div>Name: {user.name}</div>
              <div>Email: {user.email}</div>
              <div>Type: {user.type}</div>
              {user.project && <div>Project: {user.project}</div>}
              {user.previlage && <div>Privilege: {user.previlage}</div>}
            </div>
          </div>
        )}

        <Button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          variant="outline"
          className="w-full"
        >
          {isRefreshing ? "Refreshing..." : "Refresh Token"}
        </Button>
      </CardContent>
    </Card>
  )
} 