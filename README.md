# AI Model Classification Dashboard

A comprehensive Streamlit application for classifying AI models according to EU AI Act regulations.

## Features

### 🤖 Model Classification
- Upload CSV files containing AI model inventories
- Automated classification using OpenAI API
- EU AI Act compliance categories: Prohibited, High-Risk, Medium-Risk, Low-Risk, Unregulated
- Batch processing with progress tracking
- Detailed reasoning and confidence scores

### 📊 Dashboard & Analytics
- Traffic-light styled risk visualization
- Classification distribution charts
- Sector-based analysis
- Risk assessment summaries
- Historical report tracking

### 💾 Data Management
- Replit database integration for persistent storage
- CSV export functionality
- Report history and management
- Data validation and cleaning

## Quick Start

1. **Run the application:**
   ```bash
   streamlit run main.py --server.port=8501 --server.address=0.0.0.0
   ```

2. **Upload your AI model inventory:**
   - Prepare a CSV file with columns: `model_name`, `description`, `use_case`, `sector`
   - Use the provided `sample_ai_models.csv` as a template

3. **View classification results:**
   - Navigate to the Dashboard tab for visual analytics
   - Check Reports History for saved classification reports

## CSV Format

Your CSV file should contain the following columns:

- `model_name`: Name of the AI model
- `description`: Detailed description of the model's functionality
- `use_case`: Primary use case or application
- `sector`: Industry sector (e.g., Healthcare, Finance, Security)

Example:
```csv
model_name,description,use_case,sector
Credit Risk Scorer,AI model that assesses creditworthiness of loan applicants,Credit scoring and loan approval,Financial Services
Facial Recognition System,Real-time facial recognition for building access control,Security and access control,Security
```

## EU AI Act Classifications

### 🔴 Prohibited
- Social scoring systems
- Real-time facial recognition in public spaces
- Subliminal manipulation techniques
- Exploitation of vulnerable groups

### 🟠 High-Risk
- Critical infrastructure management
- Healthcare and medical devices
- Education and training systems
- Employment and HR decisions
- Law enforcement applications
- Border control and migration

### 🟡 Medium-Risk
- AI systems interacting with humans (chatbots)
- Emotion recognition systems
- Biometric categorization
- AI-generated content (deepfakes)

### 🟢 Low-Risk
- Spam filters
- Basic recommendation systems
- Simple automation tools
- Non-critical AI applications

### ⚪ Unregulated
- Personal use AI systems
- Military/defense applications
- Research and development only
- Basic software without AI components

## Technical Requirements

- Python 3.11+
- Streamlit
- OpenAI API key
- Pandas for data processing
- Replit database for storage

## Files Structure

- `main.py` - Main Streamlit application
- `classify.py` - OpenAI integration and classification logic
- `db.py` - Database operations and storage
- `utils.py` - CSV processing and utility functions
- `sample_ai_models.csv` - Sample data for testing

## Environment Variables

- `ANTHROPIC_API_KEY` - Your Anthropic (Claude) API key for model classification

## Usage Tips

1. Start with the sample CSV file to understand the format
2. Ensure your OpenAI API key is properly configured
3. Review classification results and reasoning before making compliance decisions
4. Export reports for documentation and audit purposes
5. Use the dashboard to identify high-risk models requiring immediate attention

## Support

For issues or questions, please check:
1. CSV format matches the required columns
2. OpenAI API key is valid and has sufficient credits
3. Model descriptions are detailed enough for accurate classification