# Authentication Setup

This dashboard includes a complete authentication system with signup and login functionality.

## Features

- **User Registration**: Create new accounts with email and password
- **User Login**: Authenticate with email and password
- **Protected Routes**: Dashboard pages require authentication
- **Token Management**: JWT tokens stored in localStorage
- **Automatic Redirects**: Redirects authenticated users to dashboard
- **Logout Functionality**: Clear tokens and redirect to login

## Configuration

### Environment Variables

Create a `.env.local` file in the dashboard directory with the following variables:

```env
# API Server Configuration
API_SERVER_URL=http://localhost:8000

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### API Server

The authentication system connects to the backend API server. Make sure the API server is running and accessible at the URL specified in `API_SERVER_URL`.

## File Structure

```
dashboard/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   └── signup/
│   │       └── page.tsx          # Signup page
│   ├── api/
│   │   └── auth/
│   │       ├── login/
│   │       │   └── route.ts      # Login API route
│   │       └── signup/
│   │           └── route.ts      # Signup API route
│   ├── dashboard/
│   │   ├── layout.tsx            # Protected dashboard layout
│   │   └── page.tsx              # Dashboard page
│   └── page.tsx                  # Landing page
└── components/
    └── auth/
        ├── AuthContext.tsx        # Authentication context
        └── ProtectedRoute.tsx     # Protected route component
```

## Usage

### Authentication Flow

1. **Landing Page**: Unauthenticated users see a welcome page with login/signup options
2. **Login**: Users can sign in with email and password
3. **Signup**: New users can create accounts
4. **Dashboard**: Authenticated users are redirected to the protected dashboard
5. **Logout**: Users can log out and are redirected to the landing page

### Protected Routes

All routes under `/dashboard/*` are protected and require authentication. Unauthenticated users are automatically redirected to the login page.

### API Integration

The authentication system integrates with the backend API server:

- **Login**: `POST /api/auth/login` → `POST /v0/auth/token`
- **Signup**: `POST /api/auth/signup` → `POST /v0/user/`

## Security Features

- Password hashing (handled by backend)
- JWT token authentication
- Protected routes
- Automatic token validation
- Secure token storage in localStorage

## Development

To run the dashboard with authentication:

1. Start the API server (backend)
2. Set up environment variables
3. Run the dashboard: `npm run dev`

The authentication system will automatically handle user sessions and route protection. 