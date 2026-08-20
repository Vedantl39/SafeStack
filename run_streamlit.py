#!/usr/bin/env python3
"""
Streamlit application launcher script
"""
import subprocess
import sys
import os

def main():
    # Set environment variables
    os.environ['STREAMLIT_SERVER_PORT'] = '8501'
    os.environ['STREAMLIT_SERVER_ADDRESS'] = '0.0.0.0'
    os.environ['STREAMLIT_BROWSER_GATHER_USAGE_STATS'] = 'false'
    
    # Run streamlit
    try:
        subprocess.run([
            sys.executable, '-m', 'streamlit', 'run', 'main.py',
            '--server.port=8501',
            '--server.address=0.0.0.0',
            '--browser.gatherUsageStats=false'
        ], check=True)
    except KeyboardInterrupt:
        print("\nStreamlit application stopped.")
    except subprocess.CalledProcessError as e:
        print(f"Error running Streamlit: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()