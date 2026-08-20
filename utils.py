import pandas as pd
import csv
import io
import streamlit as st
from datetime import datetime

def process_csv_file(uploaded_file):
    """
    Process uploaded CSV file and return DataFrame
    
    Args:
        uploaded_file: Streamlit uploaded file object
    
    Returns:
        pandas.DataFrame: Processed DataFrame
    """
    
    try:
        # Read CSV file
        df = pd.read_csv(uploaded_file)
        
        # Clean column names (remove spaces, convert to lowercase)
        df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')
        
        # Remove empty rows
        df = df.dropna(subset=['model_name'])
        
        # Fill missing values with "Not specified"
        df = df.fillna("Not specified")
        
        return df
        
    except Exception as e:
        st.error(f"Error processing CSV file: {str(e)}")
        raise

def validate_csv_columns(df):
    """
    Validate that CSV contains required columns
    
    Args:
        df (pandas.DataFrame): Input DataFrame
    
    Returns:
        bool: True if valid, False otherwise
    """
    
    required_columns = ['model_name', 'description', 'use_case', 'sector']
    
    # Check if all required columns are present
    missing_columns = [col for col in required_columns if col not in df.columns]
    
    if missing_columns:
        st.error(f"Missing required columns: {', '.join(missing_columns)}")
        st.info("Required columns: model_name, description, use_case, sector")
        return False
    
    return True

def create_sample_csv():
    """
    Create a sample CSV file for users to download as template
    
    Returns:
        str: CSV content as string
    """
    
    sample_data = [
        {
            'model_name': 'Credit Risk Scorer',
            'description': 'AI model that assesses creditworthiness of loan applicants',
            'use_case': 'Credit scoring and loan approval',
            'sector': 'Financial Services'
        },
        {
            'model_name': 'Facial Recognition System',
            'description': 'Real-time facial recognition for building access control',
            'use_case': 'Security and access control',
            'sector': 'Security'
        },
        {
            'model_name': 'Medical Diagnosis Assistant',
            'description': 'AI system to help doctors diagnose diseases from medical images',
            'use_case': 'Medical diagnosis support',
            'sector': 'Healthcare'
        },
        {
            'model_name': 'Recommendation Engine',
            'description': 'Product recommendation system for e-commerce',
            'use_case': 'Product recommendations',
            'sector': 'E-commerce'
        },
        {
            'model_name': 'Chatbot Assistant',
            'description': 'Customer service chatbot for handling inquiries',
            'use_case': 'Customer service automation',
            'sector': 'Customer Service'
        }
    ]
    
    # Convert to CSV string
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=['model_name', 'description', 'use_case', 'sector'])
    writer.writeheader()
    writer.writerows(sample_data)
    
    return output.getvalue()

def create_download_csv(df):
    """
    Create CSV content for download
    
    Args:
        df (pandas.DataFrame): DataFrame to convert to CSV
    
    Returns:
        str: CSV content as string
    """
    
    try:
        # Convert DataFrame to CSV string
        csv_buffer = io.StringIO()
        df.to_csv(csv_buffer, index=False)
        
        return csv_buffer.getvalue()
        
    except Exception as e:
        st.error(f"Error creating CSV download: {str(e)}")
        return ""

def format_classification_for_display(classification):
    """
    Format classification result for better display
    
    Args:
        classification (dict): Classification result
    
    Returns:
        dict: Formatted classification
    """
    
    # Map classifications to display colors
    color_map = {
        'Prohibited': '#dc2626',
        'High-Risk': '#ea580c',
        'Medium-Risk': '#ca8a04',
        'Low-Risk': '#16a34a',
        'Unregulated': '#6b7280'
    }
    
    # Add color to classification
    formatted = classification.copy()
    formatted['display_color'] = color_map.get(classification.get('classification'), '#6b7280')
    
    return formatted

def validate_model_data(model_data):
    """
    Validate individual model data
    
    Args:
        model_data (dict): Model data to validate
    
    Returns:
        tuple: (is_valid, error_message)
    """
    
    required_fields = ['model_name', 'description', 'use_case', 'sector']
    
    for field in required_fields:
        if field not in model_data or not model_data[field]:
            return False, f"Missing or empty field: {field}"
    
    # Additional validation
    if len(model_data['model_name']) > 100:
        return False, "Model name too long (max 100 characters)"
    
    if len(model_data['description']) > 500:
        return False, "Description too long (max 500 characters)"
    
    return True, ""

def clean_text_data(text):
    """
    Clean text data for processing
    
    Args:
        text (str): Input text
    
    Returns:
        str: Cleaned text
    """
    
    if not isinstance(text, str):
        return str(text)
    
    # Remove extra whitespace
    text = ' '.join(text.split())
    
    # Remove special characters that might cause issues
    text = text.replace('\n', ' ').replace('\r', ' ').replace('\t', ' ')
    
    return text.strip()

def generate_classification_report(classifications):
    """
    Generate a comprehensive classification report
    
    Args:
        classifications (list): List of classification results
    
    Returns:
        dict: Comprehensive report
    """
    
    report = {
        'timestamp': datetime.now().isoformat(),
        'total_models': len(classifications),
        'summary': {},
        'risk_analysis': {},
        'sector_analysis': {},
        'recommendations': []
    }
    
    # Classification summary
    classification_counts = {}
    for item in classifications:
        classification = item.get('classification', 'Unknown')
        classification_counts[classification] = classification_counts.get(classification, 0) + 1
    
    report['summary'] = classification_counts
    
    # Risk analysis
    high_risk_count = classification_counts.get('High-Risk', 0) + classification_counts.get('Prohibited', 0)
    report['risk_analysis'] = {
        'high_risk_models': high_risk_count,
        'risk_percentage': (high_risk_count / len(classifications)) * 100 if classifications else 0
    }
    
    # Sector analysis
    sector_counts = {}
    for item in classifications:
        sector = item.get('sector', 'Unknown')
        sector_counts[sector] = sector_counts.get(sector, 0) + 1
    
    report['sector_analysis'] = sector_counts
    
    # Recommendations
    if classification_counts.get('Prohibited', 0) > 0:
        report['recommendations'].append("Immediate action required: Prohibited AI systems detected")
    
    if classification_counts.get('High-Risk', 0) > 0:
        report['recommendations'].append("High-risk AI systems require compliance with strict EU AI Act requirements")
    
    if classification_counts.get('Medium-Risk', 0) > 0:
        report['recommendations'].append("Medium-risk AI systems must implement transparency measures")
    
    return report

def export_to_json(data):
    """
    Export data to JSON format
    
    Args:
        data: Data to export
    
    Returns:
        str: JSON string
    """
    
    try:
        import json
        return json.dumps(data, indent=2, default=str)
    except Exception as e:
        st.error(f"Error exporting to JSON: {str(e)}")
        return ""

def calculate_compliance_score(classifications):
    """
    Calculate overall compliance score
    
    Args:
        classifications (list): List of classification results
    
    Returns:
        dict: Compliance score and details
    """
    
    if not classifications:
        return {'score': 0, 'grade': 'N/A', 'details': 'No data available'}
    
    total = len(classifications)
    weights = {
        'Prohibited': 0,      # 0 points for prohibited
        'High-Risk': 60,      # 60 points for high-risk
        'Medium-Risk': 80,    # 80 points for medium-risk
        'Low-Risk': 95,       # 95 points for low-risk
        'Unregulated': 100    # 100 points for unregulated
    }
    
    total_score = 0
    for item in classifications:
        classification = item.get('classification', 'Unregulated')
        total_score += weights.get(classification, 50)
    
    average_score = total_score / total
    
    # Determine grade
    if average_score >= 90:
        grade = 'A'
    elif average_score >= 80:
        grade = 'B'
    elif average_score >= 70:
        grade = 'C'
    elif average_score >= 60:
        grade = 'D'
    else:
        grade = 'F'
    
    return {
        'score': round(average_score, 1),
        'grade': grade,
        'details': f'Based on {total} AI models analyzed'
    }