import openai
import os
import json
import streamlit as st
from openai import OpenAI

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def classify_ai_model(model_name, description, use_case, sector):
    """
    Classify an AI model according to EU AI Act regulations
    
    Args:
        model_name (str): Name of the AI model
        description (str): Description of the model
        use_case (str): Primary use case
        sector (str): Industry sector
    
    Returns:
        dict: Classification result with confidence and reasoning
    """
    
    # EU AI Act classification prompt
    prompt = f"""
    As an AI governance expert, classify the following AI model according to EU AI Act regulations.

    Model Details:
    - Name: {model_name}
    - Description: {description}
    - Use Case: {use_case}
    - Sector: {sector}

    Classification Categories:
    1. PROHIBITED: AI systems that pose unacceptable risks (e.g., social scoring, real-time facial recognition in public spaces, subliminal techniques)
    2. HIGH-RISK: AI systems in critical sectors (healthcare, transport, education, employment, law enforcement, critical infrastructure)
    3. MEDIUM-RISK: AI systems that interact with humans or generate content (chatbots, deepfakes, emotion recognition)
    4. LOW-RISK: AI systems with minimal risk (spam filters, recommendation systems)
    5. UNREGULATED: AI systems not covered by the Act

    Key Considerations:
    - Real-time biometric identification in public spaces = PROHIBITED
    - AI in critical infrastructure, healthcare, transport = HIGH-RISK
    - AI for hiring, credit scoring, education = HIGH-RISK
    - Content generation, chatbots = MEDIUM-RISK
    - Simple automation, basic recommendations = LOW-RISK

    Respond with a JSON object containing:
    {{
        "classification": "one of: Prohibited, High-Risk, Medium-Risk, Low-Risk, Unregulated",
        "confidence": "percentage as integer (0-100)",
        "reasoning": "detailed explanation of classification decision"
    }}
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert in EU AI Act regulations. Provide accurate classifications based on the official EU AI Act text."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=500
        )
        
        # Parse the response
        result = json.loads(response.choices[0].message.content)
        
        # Validate the response
        valid_classifications = ["Prohibited", "High-Risk", "Medium-Risk", "Low-Risk", "Unregulated"]
        if result.get("classification") not in valid_classifications:
            raise ValueError(f"Invalid classification: {result.get('classification')}")
        
        return result
        
    except json.JSONDecodeError:
        st.error("Error parsing OpenAI response. Please try again.")
        return {
            "classification": "Unregulated",
            "confidence": 0,
            "reasoning": "Error in classification process"
        }
    except Exception as e:
        st.error(f"Error calling OpenAI API: {str(e)}")
        return {
            "classification": "Unregulated",
            "confidence": 0,
            "reasoning": f"Error in classification process: {str(e)}"
        }

def get_classification_explanation(classification):
    """
    Get detailed explanation for each classification category
    
    Args:
        classification (str): Classification category
    
    Returns:
        str: Detailed explanation
    """
    
    explanations = {
        "Prohibited": """
        These AI systems pose unacceptable risks and are banned under the EU AI Act:
        - Social scoring systems by governments
        - Real-time facial recognition in public spaces (with limited exceptions)
        - AI systems using subliminal techniques
        - AI exploiting vulnerabilities of specific groups
        """,
        
        "High-Risk": """
        These AI systems operate in critical areas and must comply with strict requirements:
        - Biometric identification and categorization
        - Management of critical infrastructure
        - Education and vocational training
        - Employment and worker management
        - Access to essential services (credit, insurance)
        - Law enforcement
        - Migration and border control
        - Healthcare and medical devices
        """,
        
        "Medium-Risk": """
        These AI systems must implement transparency measures:
        - AI systems that interact with humans (chatbots)
        - Emotion recognition systems
        - Biometric categorization systems
        - AI-generated content (deepfakes, synthetic media)
        """,
        
        "Low-Risk": """
        These AI systems have minimal regulatory requirements:
        - Spam filters
        - Basic recommendation systems
        - Simple automation tools
        - Non-critical AI applications
        """,
        
        "Unregulated": """
        These AI systems are not covered by the EU AI Act:
        - AI systems used purely for personal use
        - AI for military, defense, or national security
        - AI used solely for research and development
        - Basic software without AI components
        """
    }
    
    return explanations.get(classification, "No explanation available")

def batch_classify_models(models_data, progress_callback=None):
    """
    Classify multiple AI models in batch
    
    Args:
        models_data (list): List of model dictionaries
        progress_callback (callable): Optional callback for progress updates
    
    Returns:
        list: List of classification results
    """
    
    results = []
    total = len(models_data)
    
    for i, model in enumerate(models_data):
        if progress_callback:
            progress_callback(i, total, model.get('model_name', 'Unknown'))
        
        classification = classify_ai_model(
            model_name=model['model_name'],
            description=model['description'],
            use_case=model['use_case'],
            sector=model['sector']
        )
        
        results.append({
            **model,
            **classification
        })
    
    return results