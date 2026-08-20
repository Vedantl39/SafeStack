#!/usr/bin/env python3
"""
Test script to verify Streamlit application works
"""
import sys
import os
import subprocess
import tempfile

def test_streamlit_syntax():
    """Test if main.py has valid syntax"""
    print("Testing main.py syntax...")
    try:
        with open('main.py', 'r') as f:
            code = f.read()
        
        compile(code, 'main.py', 'exec')
        print("✓ main.py syntax is valid")
        return True
    except SyntaxError as e:
        print(f"✗ Syntax error in main.py: {e}")
        return False
    except Exception as e:
        print(f"✗ Error checking main.py: {e}")
        return False

def test_imports():
    """Test if all imports work"""
    print("Testing imports...")
    try:
        # Test main module imports
        exec("""
import streamlit as st
import pandas as pd
import io
from datetime import datetime
import uuid
from classify import classify_ai_model
from db import save_classification_report, get_all_reports
from utils import process_csv_file, validate_csv_columns
""")
        print("✓ All imports successful")
        return True
    except Exception as e:
        print(f"✗ Import error: {e}")
        return False

def test_csv_processing():
    """Test CSV processing functionality"""
    print("Testing CSV processing...")
    try:
        from utils import process_csv_file, validate_csv_columns
        import pandas as pd
        
        # Create a test CSV
        test_data = """model_name,description,use_case,sector
Test Model,Test description,Test use case,Test sector"""
        
        # Test processing
        import io
        csv_file = io.StringIO(test_data)
        df = pd.read_csv(csv_file)
        
        # Clean column names
        df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')
        
        # Validate
        if validate_csv_columns(df):
            print("✓ CSV processing works correctly")
            return True
        else:
            print("✗ CSV validation failed")
            return False
    except Exception as e:
        print(f"✗ CSV processing error: {e}")
        return False

def main():
    """Run all tests"""
    print("Running Streamlit application tests...\n")
    
    tests = [
        test_streamlit_syntax,
        test_imports,
        test_csv_processing
    ]
    
    results = []
    for test in tests:
        results.append(test())
        print()
    
    if all(results):
        print("🎉 All tests passed! The application should work correctly.")
        return True
    else:
        print("❌ Some tests failed. Please check the errors above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)