'use client'

import { TokenInfo } from '@/components/TokenInfo'
import { FuturisticSidebar } from '@/components/FuturisticSidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/AuthContext'
import { apiGet } from '@/lib/api'

export default function TestTokenPage() {
  const { user, logout } = useAuth()

  const testApiCall = async () => {
    try {
      const response = await apiGet('/api/test')
      console.log('API Response:', response)
      alert(`API call result: ${response.status} - ${response.error || 'Success'}`)
    } catch (error) {
      console.error('API call failed:', error)
      alert('API call failed')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-card to-background opacity-95 pointer-events-none"></div>
      
      {/* Sidebar */}
      <FuturisticSidebar />
      
      {/* Main content */}
      <div className="ml-16 lg:ml-64 transition-all duration-300">
        <div className="p-6 relative z-10 w-full">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold">JWT Token Testing</h1>
              <p className="text-muted-foreground">
                Test and debug JWT token functionality
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TokenInfo />
              
              <Card>
                <CardHeader>
                  <CardTitle>User Information</CardTitle>
                  <CardDescription>Current user details from JWT token</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user ? (
                    <div className="space-y-2">
                      <div><strong>Name:</strong> {user.name}</div>
                      <div><strong>Email:</strong> {user.email}</div>
                      <div><strong>Type:</strong> {user.type}</div>
                      {user.verification_status && (
                        <div><strong>Verification:</strong> {user.verification_status}</div>
                      )}
                      {user.status && (
                        <div><strong>Status:</strong> {user.status}</div>
                      )}
                      {user.project && (
                        <div><strong>Project:</strong> {user.project}</div>
                      )}
                      {user.previlage && (
                        <div><strong>Privilege:</strong> {user.previlage}</div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No user information available</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>API Testing</CardTitle>
                <CardDescription>Test authenticated API calls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button onClick={testApiCall} variant="outline">
                    Test API Call
                  </Button>
                  <Button onClick={logout} variant="destructive">
                    Logout
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Check the browser console for detailed API call results
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Features Implemented</CardTitle>
                <CardDescription>JWT token management features</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✅ JWT token decoding and validation</li>
                  <li>✅ Automatic token expiry checking</li>
                  <li>✅ Refresh token support</li>
                  <li>✅ Automatic token refresh before expiry</li>
                  <li>✅ User information extraction from JWT</li>
                  <li>✅ Secure token storage (localStorage + cookies)</li>
                  <li>✅ Middleware protection with expiry checking</li>
                  <li>✅ API request utilities with automatic refresh</li>
                  <li>✅ Periodic token validation</li>
                  <li>✅ Graceful logout on token failure</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Subtle accent particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full opacity-10 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  )
} 