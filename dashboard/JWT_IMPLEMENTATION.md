# JWT Token Implementation with Expiry Checking and Refresh Token Support

This document describes the comprehensive JWT token management system implemented in the Exosphere dashboard.

## Overview

The implementation provides:
- JWT token decoding and validation
- Automatic token expiry checking
- Refresh token support
- Automatic token refresh before expiry
- User information extraction from JWT
- Secure token storage (localStorage + cookies)
- Middleware protection with expiry checking
- API request utilities with automatic refresh
- Periodic token validation
- Graceful logout on token failure

## Architecture

### 1. JWT Utilities (`/lib/jwt.ts`)

Core JWT token management functions:

```typescript
// Decode JWT token and extract payload
decodeJWT(token: string): JWTPayload | null

// Check if token is expired
isTokenExpired(token: string): boolean

// Get time until token expires
getTimeUntilExpiry(token: string): number

// Extract user information from token
extractUserFromToken(token: string): User | null

// Check if token should be refreshed (5-minute buffer)
shouldRefreshToken(token: string, bufferMinutes: number = 5): boolean
```

### 2. Authentication Context (`/components/auth/AuthContext.tsx`)

Enhanced AuthContext with JWT support:

- **Token Validation**: Checks token expiry on app load
- **Automatic Refresh**: Refreshes tokens before expiry
- **Periodic Validation**: Checks tokens every minute
- **User Extraction**: Extracts user info from JWT payload
- **Secure Storage**: Stores tokens in both localStorage and cookies

### 3. Middleware Protection (`/middleware.ts`)

Server-side token validation:

- Checks token expiry at the middleware level
- Redirects expired tokens to login
- Protects all routes except public ones
- Handles both cookies and Authorization headers

### 4. API Utilities (`/lib/api.ts`)

Automatic token refresh for API calls:

```typescript
// Make authenticated API requests with automatic refresh
apiRequest<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>>

// Helper functions
apiGet<T>(url: string): Promise<ApiResponse<T>>
apiPost<T>(url: string, data: any): Promise<ApiResponse<T>>
apiPut<T>(url: string, data: any): Promise<ApiResponse<T>>
apiDelete<T>(url: string): Promise<ApiResponse<T>>
```

### 5. Refresh Token API (`/app/api/auth/refresh/route.ts`)

Proxy to backend refresh endpoint:

- Calls `/v0/auth/refresh` on the API server
- Handles refresh token validation
- Returns new access token

## Token Flow

### 1. Login Process
1. User submits credentials
2. Backend validates and returns JWT tokens
3. Frontend stores tokens securely
4. User info extracted from JWT payload
5. User redirected to dashboard

### 2. Token Validation
1. App loads and checks stored tokens
2. Validates token expiry
3. If expired, attempts refresh
4. If refresh fails, logs out user
5. If valid, extracts user info

### 3. Automatic Refresh
1. Periodic check every minute
2. If token expires within 5 minutes, refresh
3. Update stored tokens
4. Update user information
5. Continue seamless experience

### 4. API Requests
1. Add Authorization header with token
2. If 401 response, attempt refresh
3. Retry request with new token
4. If refresh fails, logout user

## Security Features

### Token Storage
- **localStorage**: For client-side access
- **Cookies**: For server-side middleware access
- **Secure Settings**: SameSite=Lax, proper expiry

### Token Validation
- **Expiry Checking**: Validates token expiration
- **Signature Verification**: Backend validates signatures
- **Refresh Token Security**: Separate refresh token validation

### Automatic Cleanup
- **Failed Refresh**: Clears all tokens and redirects to login
- **Logout**: Clears tokens from all storage locations
- **Error Handling**: Graceful fallback on token issues

## Usage Examples

### Making Authenticated API Calls

```typescript
import { apiGet, apiPost } from '@/lib/api'

// GET request
const response = await apiGet('/api/workflows')
if (response.data) {
  console.log('Workflows:', response.data)
}

// POST request
const result = await apiPost('/api/workflows', {
  name: 'New Workflow',
  description: 'Test workflow'
})
```

### Using the Auth Context

```typescript
import { useAuth } from '@/components/auth/AuthContext'

function MyComponent() {
  const { user, token, logout, refreshToken } = useAuth()
  
  const handleRefresh = async () => {
    const success = await refreshToken()
    if (!success) {
      // Handle refresh failure
    }
  }
  
  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <button onClick={handleRefresh}>Refresh Token</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### Custom Hook for Authenticated Fetch

```typescript
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch'

function MyComponent() {
  const authenticatedFetch = useAuthenticatedFetch()
  
  const fetchData = async () => {
    const response = await authenticatedFetch('/api/data')
    // Automatically handles token refresh if needed
  }
}
```

## Testing

Visit `/test-token` to see:
- Real-time token expiry countdown
- User information extracted from JWT
- Token status and refresh functionality
- API call testing with automatic refresh

## Configuration

### Environment Variables
```env
API_SERVER_URL=http://localhost:8000
```

### Token Settings
- **Access Token Expiry**: 1 hour (configurable on backend)
- **Refresh Token Expiry**: 7 days (configurable on backend)
- **Refresh Buffer**: 5 minutes before expiry
- **Validation Interval**: Every minute

## Error Handling

### Common Scenarios
1. **Token Expired**: Automatic refresh attempt
2. **Refresh Failed**: Logout and redirect to login
3. **Network Error**: Retry with exponential backoff
4. **Invalid Token**: Clear tokens and redirect

### Debugging
- Check browser console for detailed logs
- Use `/test-token` page for token inspection
- Monitor network requests for refresh attempts

## Best Practices

1. **Always use the provided API utilities** for authenticated requests
2. **Don't manually handle tokens** - use the AuthContext
3. **Handle loading states** during token refresh
4. **Test token expiry scenarios** during development
5. **Monitor refresh token usage** for security

## Future Enhancements

- [ ] Token rotation for enhanced security
- [ ] Multiple refresh token support
- [ ] Offline token validation
- [ ] Token blacklisting support
- [ ] Enhanced error reporting 