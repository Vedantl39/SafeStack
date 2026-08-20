#!/usr/bin/env python3

# Test script to verify all imports work correctly
import sys

try:
    import streamlit as st
    print("✓ Streamlit imported successfully")
except ImportError as e:
    print(f"✗ Streamlit import failed: {e}")
    sys.exit(1)

try:
    import pandas as pd
    print("✓ Pandas imported successfully")
except ImportError as e:
    print(f"✗ Pandas import failed: {e}")
    sys.exit(1)

try:
    import openai
    print("✓ OpenAI imported successfully")
except ImportError as e:
    print(f"✗ OpenAI import failed: {e}")
    sys.exit(1)

try:
    from datetime import datetime
    print("✓ Datetime imported successfully")
except ImportError as e:
    print(f"✗ Datetime import failed: {e}")
    sys.exit(1)

try:
    import uuid
    print("✓ UUID imported successfully")
except ImportError as e:
    print(f"✗ UUID import failed: {e}")
    sys.exit(1)

try:
    import io
    print("✓ IO imported successfully")
except ImportError as e:
    print(f"✗ IO import failed: {e}")
    sys.exit(1)

# Test custom modules
try:
    from classify import classify_ai_model
    print("✓ Custom classify module imported successfully")
except ImportError as e:
    print(f"✗ Custom classify module import failed: {e}")

try:
    from db import save_classification_report, get_all_reports
    print("✓ Custom db module imported successfully")
except ImportError as e:
    print(f"✗ Custom db module import failed: {e}")

try:
    from utils import process_csv_file, validate_csv_columns
    print("✓ Custom utils module imported successfully")
except ImportError as e:
    print(f"✗ Custom utils module import failed: {e}")

print("\nAll critical imports successful! The application should work.")