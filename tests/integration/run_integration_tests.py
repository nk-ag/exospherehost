#!/usr/bin/env python3
"""
Integration test runner for the exosphere system.

This script sets up the environment and runs integration tests for:
- state-manager
- api-server
- niku runtime integration

Usage:
    python run_integration_tests.py [options]

Options:
    --state-manager-only    Run only state-manager integration tests
    --api-server-only       Run only api-server integration tests
    --niku-only            Run only niku integration tests
    --all                  Run all integration tests (default)
    --verbose              Enable verbose output
    --help                 Show this help message
"""

import os
import sys
import subprocess
import argparse
import time
import signal
from pathlib import Path
from typing import List, Optional

# Add the project root to the path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))


def check_dependencies():
    """Check if required dependencies are available."""
    required_packages = [
        "pytest",
        "pytest-asyncio",
        "httpx",
        "pymongo",
        "redis"
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package.replace("-", "_"))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"❌ Missing required packages: {', '.join(missing_packages)}")
        print("Please install them with: pip install " + " ".join(missing_packages))
        return False
    
    print("✅ All required packages are available")
    return True


def check_services():
    """Check if required services are running."""
    import httpx
    
    services = [
        ("State Manager", "http://localhost:8000/health"),
        ("API Server", "http://localhost:8001/health"),
    ]
    
    all_available = True
    for service_name, url in services:
        try:
            response = httpx.get(url, timeout=5)
            if response.status_code == 200:
                print(f"✅ {service_name} is available at {url}")
            else:
                print(f"❌ {service_name} is not responding correctly at {url}")
                all_available = False
        except Exception as e:
            print(f"❌ {service_name} is not available at {url}: {e}")
            all_available = False
    
    return all_available


def setup_environment():
    """Set up the test environment."""
    # Set default environment variables if not already set
    env_vars = {
        "STATE_MANAGER_URL": "http://localhost:8000",
        "API_SERVER_URL": "http://localhost:8001",
        "MONGO_URI": "mongodb://localhost:27017",
        "REDIS_URL": "redis://localhost:6379",
        "STATE_MANAGER_SECRET": "test-secret",
        "NIKU_API_KEY": "niki",
        "PYTHONPATH": str(project_root)
    }
    
    for key, value in env_vars.items():
        if key not in os.environ:
            os.environ[key] = value
            print(f"🔧 Set {key}={value}")


def run_pytest_tests(test_paths: List[str], verbose: bool = False):
    """Run pytest with the given test paths."""
    cmd = [
        sys.executable, "-m", "pytest",
        "-v" if verbose else "-q",
        "--tb=short",
        "--strict-markers",
        "--disable-warnings",
        "--color=yes"
    ]
    
    cmd.extend(test_paths)
    
    print(f"🚀 Running tests: {' '.join(cmd)}")
    print("=" * 80)
    
    try:
        # Set PYTHONPATH to include the project root
        env = os.environ.copy()
        env["PYTHONPATH"] = str(project_root)
        
        result = subprocess.run(cmd, cwd=project_root, env=env, check=False)
        return result.returncode == 0
    except KeyboardInterrupt:
        print("\n⚠️  Tests interrupted by user")
        return False
    except Exception as e:
        print(f"❌ Error running tests: {e}")
        return False


def run_state_manager_tests(verbose: bool = False):
    """Run state-manager integration tests."""
    print("\n🧪 Running State Manager Integration Tests")
    print("=" * 50)
    
    test_path = "state-manager/tests/integration/test_full_workflow_integration.py"
    return run_pytest_tests([test_path], verbose)


def run_api_server_tests(verbose: bool = False):
    """Run api-server integration tests."""
    print("\n🧪 Running API Server Integration Tests")
    print("=" * 50)
    
    test_path = "api-server/tests/integration/test_api_server_integration.py"
    return run_pytest_tests([test_path], verbose)


def run_niku_tests(verbose: bool = False):
    """Run niku integration tests."""
    print("\n🧪 Running Niku Integration Tests")
    print("=" * 50)
    
    test_path = "tests/integration/test_niku_full_integration.py"
    return run_pytest_tests([test_path], verbose)


def run_all_tests(verbose: bool = False):
    """Run all integration tests."""
    print("\n🧪 Running All Integration Tests")
    print("=" * 50)
    
    test_paths = [
        "state-manager/tests/integration/test_full_workflow_integration.py",
        "api-server/tests/integration/test_api_server_integration.py",
        "tests/integration/test_niku_full_integration.py"
    ]
    
    return run_pytest_tests(test_paths, verbose)


def main():
    """Main function to run integration tests."""
    parser = argparse.ArgumentParser(
        description="Run integration tests for the exosphere system",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python run_integration_tests.py                    # Run all tests
  python run_integration_tests.py --state-manager-only  # Run only state-manager tests
  python run_integration_tests.py --api-server-only     # Run only api-server tests
  python run_integration_tests.py --niku-only           # Run only niku tests
  python run_integration_tests.py --verbose             # Run with verbose output
        """
    )
    
    parser.add_argument(
        "--state-manager-only",
        action="store_true",
        help="Run only state-manager integration tests"
    )
    
    parser.add_argument(
        "--api-server-only",
        action="store_true",
        help="Run only api-server integration tests"
    )
    
    parser.add_argument(
        "--niku-only",
        action="store_true",
        help="Run only niku integration tests"
    )
    
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose output"
    )
    
    args = parser.parse_args()
    
    print("🚀 Exosphere Integration Test Runner")
    print("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Set up environment
    setup_environment()
    
    # Check services
    if not check_services():
        print("\n⚠️  Some services are not available.")
        print("Please ensure the following services are running:")
        print("  - MongoDB on localhost:27017")
        print("  - Redis on localhost:6379")
        print("  - State Manager on localhost:8000")
        print("  - API Server on localhost:8001")
        print("\nYou can start them using Docker or your preferred method.")
        
        response = input("\nDo you want to continue anyway? (y/N): ")
        if response.lower() != 'y':
            sys.exit(1)
    
    # Determine which tests to run
    success = True
    
    if args.state_manager_only:
        success = run_state_manager_tests(args.verbose)
    elif args.api_server_only:
        success = run_api_server_tests(args.verbose)
    elif args.niku_only:
        success = run_niku_tests(args.verbose)
    else:
        success = run_all_tests(args.verbose)
    
    # Print summary
    print("\n" + "=" * 50)
    if success:
        print("🎉 All integration tests passed!")
        sys.exit(0)
    else:
        print("❌ Some integration tests failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()
