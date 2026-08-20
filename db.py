import os
from datetime import datetime
import json
import streamlit as st

# Try to import replit db, fallback to local storage if not available
try:
    from replit import db
    REPLIT_DB_AVAILABLE = True
except ImportError:
    REPLIT_DB_AVAILABLE = False
    # Create a simple local storage fallback
    import shelve
    
    class LocalDB:
        def __init__(self):
            self.shelf_path = "local_ai_classification_db"
        
        def __getitem__(self, key):
            with shelve.open(self.shelf_path) as shelf:
                return shelf[key]
        
        def __setitem__(self, key, value):
            with shelve.open(self.shelf_path) as shelf:
                shelf[key] = value
        
        def __delitem__(self, key):
            with shelve.open(self.shelf_path) as shelf:
                del shelf[key]
        
        def keys(self):
            with shelve.open(self.shelf_path) as shelf:
                return list(shelf.keys())
        
        def __contains__(self, key):
            with shelve.open(self.shelf_path) as shelf:
                return key in shelf
    
    db = LocalDB()

def save_classification_report(report_id, classifications):
    """
    Save classification report to database
    
    Args:
        report_id (str): Unique identifier for the report
        classifications (list): List of classification results
    
    Returns:
        bool: Success status
    """
    
    try:
        report_data = {
            "report_id": report_id,
            "timestamp": datetime.now().isoformat(),
            "classifications": classifications,
            "total_models": len(classifications),
            "summary": get_classification_summary(classifications)
        }
        
        db[f"report_{report_id}"] = report_data
        
        # Also save to index for easy retrieval
        update_reports_index(report_id, report_data)
        
        return True
        
    except Exception as e:
        st.error(f"Error saving report: {str(e)}")
        return False

def get_classification_summary(classifications):
    """
    Generate summary statistics for classifications
    
    Args:
        classifications (list): List of classification results
    
    Returns:
        dict: Summary statistics
    """
    
    summary = {
        "total": len(classifications),
        "prohibited": 0,
        "high_risk": 0,
        "medium_risk": 0,
        "low_risk": 0,
        "unregulated": 0
    }
    
    for classification in classifications:
        risk_level = classification.get('classification', '').lower().replace('-', '_')
        if risk_level in summary:
            summary[risk_level] += 1
    
    return summary

def update_reports_index(report_id, report_data):
    """
    Update the reports index for efficient retrieval
    
    Args:
        report_id (str): Report identifier
        report_data (dict): Report data
    """
    
    try:
        # Get existing index or create new one
        if "reports_index" in db:
            index = db["reports_index"]
        else:
            index = {}
        
        # Add report to index
        index[report_id] = {
            "timestamp": report_data["timestamp"],
            "total_models": report_data["total_models"],
            "summary": report_data["summary"]
        }
        
        # Save updated index
        db["reports_index"] = index
        
    except Exception as e:
        st.error(f"Error updating reports index: {str(e)}")

def get_all_reports():
    """
    Get all classification reports
    
    Returns:
        dict: All reports data
    """
    
    try:
        reports = {}
        
        # Get all keys that start with "report_"
        all_keys = db.keys()
        report_keys = [key for key in all_keys if key.startswith("report_")]
        
        for key in report_keys:
            report_id = key.replace("report_", "")
            reports[report_id] = db[key]
        
        return reports
        
    except Exception as e:
        st.error(f"Error retrieving reports: {str(e)}")
        return {}

def get_report_by_id(report_id):
    """
    Get a specific report by ID
    
    Args:
        report_id (str): Report identifier
    
    Returns:
        dict: Report data or None if not found
    """
    
    try:
        key = f"report_{report_id}"
        if key in db:
            return db[key]
        return None
        
    except Exception as e:
        st.error(f"Error retrieving report {report_id}: {str(e)}")
        return None

def delete_report(report_id):
    """
    Delete a classification report
    
    Args:
        report_id (str): Report identifier
    
    Returns:
        bool: Success status
    """
    
    try:
        key = f"report_{report_id}"
        if key in db:
            del db[key]
            
            # Also remove from index
            if "reports_index" in db:
                index = db["reports_index"]
                if report_id in index:
                    del index[report_id]
                    db["reports_index"] = index
            
            return True
        return False
        
    except Exception as e:
        st.error(f"Error deleting report {report_id}: {str(e)}")
        return False

def get_reports_summary():
    """
    Get summary of all reports
    
    Returns:
        dict: Summary statistics across all reports
    """
    
    try:
        reports = get_all_reports()
        
        total_summary = {
            "total_reports": len(reports),
            "total_models": 0,
            "prohibited": 0,
            "high_risk": 0,
            "medium_risk": 0,
            "low_risk": 0,
            "unregulated": 0
        }
        
        for report_data in reports.values():
            summary = report_data.get("summary", {})
            total_summary["total_models"] += summary.get("total", 0)
            total_summary["prohibited"] += summary.get("prohibited", 0)
            total_summary["high_risk"] += summary.get("high_risk", 0)
            total_summary["medium_risk"] += summary.get("medium_risk", 0)
            total_summary["low_risk"] += summary.get("low_risk", 0)
            total_summary["unregulated"] += summary.get("unregulated", 0)
        
        return total_summary
        
    except Exception as e:
        st.error(f"Error getting reports summary: {str(e)}")
        return {}

def export_all_data():
    """
    Export all classification data
    
    Returns:
        dict: All data for export
    """
    
    try:
        reports = get_all_reports()
        export_data = {
            "export_timestamp": datetime.now().isoformat(),
            "reports": reports,
            "summary": get_reports_summary()
        }
        
        return export_data
        
    except Exception as e:
        st.error(f"Error exporting data: {str(e)}")
        return {}

def clear_all_data():
    """
    Clear all classification data (use with caution)
    
    Returns:
        bool: Success status
    """
    
    try:
        # Get all report keys
        all_keys = db.keys()
        report_keys = [key for key in all_keys if key.startswith("report_")]
        
        # Delete all reports
        for key in report_keys:
            del db[key]
        
        # Delete index
        if "reports_index" in db:
            del db["reports_index"]
        
        return True
        
    except Exception as e:
        st.error(f"Error clearing data: {str(e)}")
        return False