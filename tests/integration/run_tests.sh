#!/bin/bash

# Integration Test Runner Script
# This script sets up the environment and runs integration tests

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a service is running
check_service() {
    local service_name=$1
    local url=$2
    
    if curl -s "$url" >/dev/null 2>&1; then
        print_success "$service_name is running at $url"
        return 0
    else
        print_warning "$service_name is not running at $url"
        return 1
    fi
}

# Function to install Python dependencies
install_dependencies() {
    print_status "Installing Python dependencies..."
    
    if [ -f "requirements-test.txt" ]; then
        pip install -r requirements-test.txt
        print_success "Dependencies installed successfully"
    else
        print_warning "requirements-test.txt not found, installing basic dependencies..."
        pip install pytest pytest-asyncio httpx pymongo redis python-dotenv
        print_success "Basic dependencies installed"
    fi
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Python
    if ! command_exists python3; then
        print_error "Python 3 is not installed"
        exit 1
    fi
    
    # Check pip
    if ! command_exists pip; then
        print_error "pip is not installed"
        exit 1
    fi
    
    # Check Docker (optional)
    if command_exists docker; then
        print_success "Docker is available"
    else
        print_warning "Docker is not available - you may need to start services manually"
    fi
    
    print_success "Prerequisites check completed"
}

# Function to start services with Docker
start_services_docker() {
    print_status "Starting services with Docker..."
    
    # Start MongoDB
    if ! docker ps | grep -q mongodb; then
        print_status "Starting MongoDB..."
        docker run -d --name mongodb -p 27017:27017 mongo:latest || print_warning "MongoDB container already exists"
    fi
    
    # Start Redis
    if ! docker ps | grep -q redis; then
        print_status "Starting Redis..."
        docker run -d --name redis -p 6379:6379 redis:latest || print_warning "Redis container already exists"
    fi
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 5
    
    # Check if services are running
    check_service "MongoDB" "http://localhost:27017"
    check_service "Redis" "http://localhost:6379"
}

# Function to check if services are running
check_services() {
    print_status "Checking if required services are running..."
    
    local all_services_ok=true
    
    # Check State Manager
    if ! check_service "State Manager" "http://localhost:8000/health"; then
        all_services_ok=false
    fi
    
    # Check API Server
    if ! check_service "API Server" "http://localhost:8001/health"; then
        all_services_ok=false
    fi
    
    if [ "$all_services_ok" = false ]; then
        print_warning "Some services are not running"
        echo "Please ensure the following services are running:"
        echo "  - State Manager on localhost:8000"
        echo "  - API Server on localhost:8001"
        echo "  - MongoDB on localhost:27017"
        echo "  - Redis on localhost:6379"
        echo ""
        read -p "Do you want to continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Function to run tests
run_tests() {
    local test_type=$1
    local verbose=$2
    
    print_status "Running $test_type tests..."
    
    case $test_type in
        "all")
            python run_integration_tests.py $verbose
            ;;
        "state-manager")
            python run_integration_tests.py --state-manager-only $verbose
            ;;
        "api-server")
            python run_integration_tests.py --api-server-only $verbose
            ;;
        "niku")
            python run_integration_tests.py --niku-only $verbose
            ;;
        *)
            print_error "Unknown test type: $test_type"
            exit 1
            ;;
    esac
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS] [TEST_TYPE]"
    echo ""
    echo "OPTIONS:"
    echo "  -h, --help          Show this help message"
    echo "  -v, --verbose       Enable verbose output"
    echo "  -d, --docker        Start services with Docker"
    echo "  -i, --install       Install dependencies"
    echo ""
    echo "TEST_TYPE:"
    echo "  all                 Run all integration tests (default)"
    echo "  state-manager       Run only state-manager tests"
    echo "  api-server          Run only api-server tests"
    echo "  niku                Run only niku tests"
    echo ""
    echo "EXAMPLES:"
    echo "  $0                    # Run all tests"
    echo "  $0 -v                 # Run all tests with verbose output"
    echo "  $0 -d state-manager   # Start services with Docker and run state-manager tests"
    echo "  $0 -i -v all          # Install dependencies and run all tests with verbose output"
}

# Main script
main() {
    local test_type="all"
    local verbose=""
    local use_docker=false
    local install_deps=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -v|--verbose)
                verbose="--verbose"
                shift
                ;;
            -d|--docker)
                use_docker=true
                shift
                ;;
            -i|--install)
                install_deps=true
                shift
                ;;
            all|state-manager|api-server|niku)
                test_type=$1
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    echo "🚀 Exosphere Integration Test Runner"
    echo "======================================"
    
    # Check prerequisites
    check_prerequisites
    
    # Install dependencies if requested
    if [ "$install_deps" = true ]; then
        install_dependencies
    fi
    
    # Start services with Docker if requested
    if [ "$use_docker" = true ]; then
        start_services_docker
    fi
    
    # Check if services are running
    check_services
    
    # Run tests
    run_tests "$test_type" "$verbose"
    
    print_success "Test execution completed!"
}

# Run main function with all arguments
main "$@"
