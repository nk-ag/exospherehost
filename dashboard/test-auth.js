// Simple test script to verify authentication endpoints
// Run with: node test-auth.js

const API_BASE = 'http://localhost:8000'

async function testSignup() {
  console.log('Testing signup...')
  
  try {
    const response = await fetch(`${API_BASE}/v0/user/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        type: 'HUMAN',
        identifier: 'test@example.com',
        credential: 'password123',
      }),
    })

    const data = await response.json()
    console.log('Signup response:', response.status, data)
    
    if (response.ok) {
      console.log('✅ Signup successful')
      return true
    } else {
      console.log('❌ Signup failed:', data.detail)
      return false
    }
  } catch (error) {
    console.log('❌ Signup error:', error.message)
    return false
  }
}

async function testLogin() {
  console.log('Testing login...')
  
  try {
    const response = await fetch(`${API_BASE}/v0/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'test@example.com',
        credential: 'password123',
      }),
    })

    const data = await response.json()
    console.log('Login response:', response.status, data)
    
    if (response.ok) {
      console.log('✅ Login successful')
      console.log('Access token:', data.access_token ? 'Present' : 'Missing')
      console.log('Refresh token:', data.refresh_token ? 'Present' : 'Missing')
      return true
    } else {
      console.log('❌ Login failed:', data.detail)
      return false
    }
  } catch (error) {
    console.log('❌ Login error:', error.message)
    return false
  }
}

async function runTests() {
  console.log('🚀 Starting authentication tests...\n')
  
  const signupSuccess = await testSignup()
  console.log('')
  
  if (signupSuccess) {
    await testLogin()
  }
  
  console.log('\n✨ Tests completed!')
}

runTests() 