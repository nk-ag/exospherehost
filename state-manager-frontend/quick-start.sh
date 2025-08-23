#!/bin/bash

# State Manager Frontend Quick Start Script

echo "🚀 Starting State Manager Frontend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "🔧 Creating .env.local file..."
    cat > .env.local << EOF
# State Manager Frontend Environment Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
EOF
    echo "✅ Created .env.local file"
fi

# Start the development server
echo "🌐 Starting development server..."
echo "📱 Frontend will be available at: http://localhost:3000"
echo "🔗 Make sure your State Manager backend is running at: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
