@echo off
REM State Manager Frontend Quick Start Script for Windows

echo 🚀 Starting State Manager Frontend...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Create .env.local if it doesn't exist
if not exist .env.local (
    echo 🔧 Creating .env.local file...
    (
        echo # State Manager Frontend Environment Configuration
        echo NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
    ) > .env.local
    echo ✅ Created .env.local file
)

REM Start the development server
echo 🌐 Starting development server...
echo 📱 Frontend will be available at: http://localhost:3000
echo 🔗 Make sure your State Manager backend is running at: http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev
