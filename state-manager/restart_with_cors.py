#!/usr/bin/env python3
"""
Script to restart the State Manager with CORS support
"""
import subprocess
import sys
import os
import time

def restart_state_manager():
    """Restart the state manager with CORS support"""
    print("🔄 Restarting State Manager with CORS support...")
    
    # Kill any existing state manager processes
    try:
        subprocess.run(["pkill", "-f", "state-manager"], check=False)
        time.sleep(2)
    except:
        pass
    
    # Start the state manager
    try:
        # Change to the state manager directory
        os.chdir(os.path.dirname(os.path.abspath(__file__)))
        
        # Start the server
        print("🚀 Starting State Manager...")
        subprocess.run([sys.executable, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"])
    except KeyboardInterrupt:
        print("\n🛑 State Manager stopped by user")
    except Exception as e:
        print(f"❌ Error starting State Manager: {e}")

if __name__ == "__main__":
    restart_state_manager()
