import streamlit as st
import pandas as pd
import io
from datetime import datetime
import uuid

# Import custom modules
from classify import classify_ai_model
from db import save_classification_report, get_all_reports, get_report_by_id
from utils import process_csv_file, validate_csv_columns, create_download_csv

# Page config
st.set_page_config(
    page_title="AI Model Classification Dashboard",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for traffic light styling
st.markdown("""
<style>
    .metric-card {
        background: white;
        padding: 1rem;
        border-radius: 0.5rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin: 0.5rem 0;
    }
    .prohibited { color: #dc2626; background-color: #fee2e2; }
    .high-risk { color: #ea580c; background-color: #fed7aa; }
    .medium-risk { color: #ca8a04; background-color: #fef3c7; }
    .low-risk { color: #16a34a; background-color: #dcfce7; }
    .unregulated { color: #6b7280; background-color: #f9fafb; }
</style>
""", unsafe_allow_html=True)

def main():
    st.title("🤖 AI Model Classification Dashboard")
    st.markdown("*Classify AI models according to EU AI Act regulations*")
    
    # Sidebar
    st.sidebar.title("Navigation")
    page = st.sidebar.selectbox(
        "Choose a page:",
        ["Model Classifier", "Dashboard", "Reports History"]
    )
    
    if page == "Model Classifier":
        model_classifier_page()
    elif page == "Dashboard":
        dashboard_page()
    elif page == "Reports History":
        reports_history_page()

def model_classifier_page():
    st.header("📊 Model Classification")
    
    # File upload
    uploaded_file = st.file_uploader(
        "Upload CSV file with AI model inventory",
        type=['csv'],
        help="CSV should contain columns: model_name, description, use_case, sector"
    )
    
    if uploaded_file is not None:
        try:
            # Process the CSV
            df = process_csv_file(uploaded_file)
            
            # Validate columns
            if not validate_csv_columns(df):
                st.error("CSV must contain columns: model_name, description, use_case, sector")
                return
            
            st.success(f"✅ Successfully loaded {len(df)} AI models")
            
            # Show preview
            with st.expander("📋 Preview Data"):
                st.dataframe(df.head())
            
            # Classification settings
            st.subheader("Classification Settings")
            
            col1, col2 = st.columns(2)
            with col1:
                batch_size = st.slider("Batch size for processing", 1, 20, 5)
            with col2:
                save_report = st.checkbox("Save classification report", value=True)
            
            # Start classification
            if st.button("🚀 Start Classification", type="primary"):
                classify_models(df, batch_size, save_report)
                
        except Exception as e:
            st.error(f"Error processing file: {str(e)}")

def classify_models(df, batch_size, save_report):
    """Classify AI models and display results"""
    
    # Progress tracking
    progress_bar = st.progress(0)
    status_text = st.empty()
    
    results = []
    total_models = len(df)
    
    for i in range(0, total_models, batch_size):
        batch = df.iloc[i:i+batch_size]
        
        for idx, row in batch.iterrows():
            status_text.text(f"Classifying {row['model_name']}...")
            
            # Classify using OpenAI
            classification = classify_ai_model(
                model_name=row['model_name'],
                description=row['description'],
                use_case=row['use_case'],
                sector=row['sector']
            )
            
            results.append({
                'model_name': row['model_name'],
                'description': row['description'],
                'use_case': row['use_case'],
                'sector': row['sector'],
                'classification': classification['classification'],
                'confidence': classification['confidence'],
                'reasoning': classification['reasoning'],
                'timestamp': datetime.now().isoformat()
            })
            
            # Update progress
            progress = (len(results)) / total_models
            progress_bar.progress(progress)
    
    # Create results DataFrame
    results_df = pd.DataFrame(results)
    
    # Display results
    st.subheader("🎯 Classification Results")
    
    # Summary metrics
    show_classification_summary(results_df)
    
    # Detailed results
    st.subheader("📝 Detailed Results")
    st.dataframe(results_df)
    
    # Save to database
    if save_report:
        report_id = str(uuid.uuid4())
        save_classification_report(report_id, results_df.to_dict('records'))
        st.success(f"✅ Report saved with ID: {report_id}")
    
    # Download option
    csv_data = create_download_csv(results_df)
    st.download_button(
        label="📥 Download Classification Report",
        data=csv_data,
        file_name=f"ai_classification_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
        mime="text/csv"
    )

def get_classification_color(classification):
    """Get color for classification"""
    colors = {
        'Prohibited': '#dc2626',
        'High-Risk': '#ea580c',
        'Medium-Risk': '#ca8a04',
        'Low-Risk': '#16a34a',
        'Unregulated': '#6b7280'
    }
    return colors.get(classification, '#6b7280')

def show_classification_summary(df):
    """Display summary of classifications with traffic light colors"""
    
    # Count classifications
    counts = df['classification'].value_counts()
    
    # Create columns for metrics
    cols = st.columns(5)
    
    classifications = ['Prohibited', 'High-Risk', 'Medium-Risk', 'Low-Risk', 'Unregulated']
    
    for i, classification in enumerate(classifications):
        count = counts.get(classification, 0)
        color = get_classification_color(classification)
        with cols[i]:
            st.markdown(f"""
            <div class="metric-card">
                <h3 style="color: {color}; margin: 0;">{count}</h3>
                <p style="margin: 0; font-size: 0.9rem;">{classification}</p>
            </div>
            """, unsafe_allow_html=True)

def dashboard_page():
    st.header("📈 Classification Dashboard")
    
    # Load all reports
    reports = get_all_reports()
    
    if not reports:
        st.info("No classification reports found. Please classify some models first.")
        return
    
    # Combine all reports
    all_classifications = []
    for report_id, report_data in reports.items():
        for record in report_data['classifications']:
            record['report_id'] = report_id
            all_classifications.append(record)
    
    df = pd.DataFrame(all_classifications)
    
    # Overview metrics
    st.subheader("📊 Overview")
    show_classification_summary(df)
    
    # Charts using Streamlit's built-in chart functionality
    col1, col2 = st.columns(2)
    
    with col1:
        # Classification distribution using bar chart
        st.subheader("Classification Distribution")
        classification_counts = df['classification'].value_counts()
        st.bar_chart(classification_counts)
        
        # Display the actual counts
        for classification, count in classification_counts.items():
            color = get_classification_color(classification)
            st.markdown(f"**{classification}:** {count} models")
    
    with col2:
        # Sector analysis
        st.subheader("Classifications by Sector")
        sector_counts = df.groupby(['sector', 'classification']).size().reset_index(name='count')
        
        # Create a pivot table for better visualization
        pivot_data = sector_counts.pivot(index='sector', columns='classification', values='count').fillna(0)
        
        # Display as a data table with color coding
        st.dataframe(pivot_data, use_container_width=True)
        
        # Show sector summary
        st.write("**Sector Summary:**")
        sector_totals = df['sector'].value_counts()
        for sector, count in sector_totals.items():
            st.write(f"- {sector}: {count} models")
    
    # Risk analysis
    st.subheader("⚠️ Risk Analysis")
    
    # High-risk and prohibited models
    high_risk_models = df[df['classification'].isin(['Prohibited', 'High-Risk'])]
    
    if not high_risk_models.empty:
        st.error(f"🚨 {len(high_risk_models)} models require immediate attention")
        
        # Show high-risk models
        st.dataframe(
            high_risk_models[['model_name', 'use_case', 'sector', 'classification', 'reasoning']],
            use_container_width=True
        )
    else:
        st.success("✅ No high-risk or prohibited models detected")

def reports_history_page():
    st.header("📁 Reports History")
    
    reports = get_all_reports()
    
    if not reports:
        st.info("No reports found.")
        return
    
    # Display reports
    for report_id, report_data in reports.items():
        with st.expander(f"Report {report_id[:8]}... ({len(report_data['classifications'])} models)"):
            st.write(f"**Created:** {report_data['timestamp']}")
            st.write(f"**Total Models:** {len(report_data['classifications'])}")
            
            # Quick stats
            df_report = pd.DataFrame(report_data['classifications'])
            counts = df_report['classification'].value_counts()
            st.write("**Classifications:**")
            for classification, count in counts.items():
                st.write(f"- {classification}: {count}")
            
            # Download button
            csv_data = create_download_csv(df_report)
            st.download_button(
                label=f"📥 Download Report {report_id[:8]}",
                data=csv_data,
                file_name=f"report_{report_id[:8]}_{datetime.now().strftime('%Y%m%d')}.csv",
                mime="text/csv",
                key=f"download_{report_id}"
            )

if __name__ == "__main__":
    main()