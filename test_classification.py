#!/usr/bin/env python3
"""
Test the AI model classification functionality
"""
import os
from classify import classify_ai_model

def test_single_classification():
    """Test classification of a single AI model"""
    print("Testing AI Model Classification...")
    
    # Check if OpenAI API key is available
    if not os.getenv("OPENAI_API_KEY"):
        print("⚠️  OpenAI API key not found. Please set OPENAI_API_KEY environment variable.")
        return False
    
    # Test data
    test_model = {
        "model_name": "Credit Risk Scorer",
        "description": "AI model that assesses creditworthiness of loan applicants using machine learning algorithms to analyze financial data and predict default risk",
        "use_case": "Credit scoring and loan approval automation",
        "sector": "Financial Services"
    }
    
    try:
        print(f"Classifying model: {test_model['model_name']}")
        print(f"Description: {test_model['description']}")
        print(f"Use case: {test_model['use_case']}")
        print(f"Sector: {test_model['sector']}")
        print("\nClassification in progress...")
        
        result = classify_ai_model(
            model_name=test_model['model_name'],
            description=test_model['description'],
            use_case=test_model['use_case'],
            sector=test_model['sector']
        )
        
        print(f"\n✓ Classification completed!")
        print(f"Result: {result['classification']}")
        print(f"Confidence: {result['confidence']}%")
        print(f"Reasoning: {result['reasoning']}")
        
        return True
        
    except Exception as e:
        print(f"✗ Classification failed: {e}")
        return False

def main():
    """Run the test"""
    print("AI Model Classification Test")
    print("=" * 50)
    
    success = test_single_classification()
    
    if success:
        print("\n🎉 Test completed successfully!")
        print("The classification system is working correctly.")
    else:
        print("\n❌ Test failed!")
        print("Please check your OpenAI API key and try again.")

if __name__ == "__main__":
    main()