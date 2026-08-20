import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ClassificationResult {
  aiActStatus: 'Prohibited' | 'High-Risk' | 'Medium-Risk' | 'Low-Risk' | 'Unregulated';
  detectedRisks: string[];
  riskTier: 'High' | 'Medium' | 'Low';
}

export async function classifyAiModel(purpose: string, useCaseType: string, inputData?: string): Promise<ClassificationResult> {
  const prompt = `
You are an AI compliance assistant. Based on the purpose and use case of an AI system, classify it according to the EU AI Act into one of the following categories:
- "Prohibited"
- "High-Risk"
- "Medium-Risk"
- "Low-Risk"
- "Unregulated"

Definitions:
- Prohibited: Includes real-time biometric ID in public spaces, social scoring, manipulation of behavior, etc.
- High-Risk: AI used in recruitment, credit scoring, biometric identification, law enforcement, education, etc.
- Medium-Risk: AI systems that require transparency obligations, like chatbots or emotion detection systems.
- Low-Risk: AI systems with minimal risks to fundamental rights or safety, such as spam filters or recommendation engines.
- Unregulated: General-purpose or low-impact AI not covered above.

Purpose: ${purpose}
Use Case: ${useCaseType}
Input Data: ${inputData || 'Not specified'}

Also identify any detected risks from the following categories:
- Sensitive Data Usage
- No Human Oversight
- Unclear Legal Basis
- Lack of Fairness Explanation
- Missing Documentation
- No Performance Metrics

Please respond in the following JSON format:
{
  "aiActStatus": "one of the five classifications",
  "detectedRisks": ["list of detected risks"],
  "reasoning": "brief explanation of the classification"
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(content);
    
    // Determine risk tier based on detected risks and AI Act status
    let riskTier: 'High' | 'Medium' | 'Low' = 'Low';
    
    if (parsed.aiActStatus === 'Prohibited' || parsed.aiActStatus === 'High-Risk') {
      riskTier = 'High';
    } else if (parsed.aiActStatus === 'Medium-Risk') {
      riskTier = 'Medium';
    } else if (parsed.detectedRisks.some((risk: string) => 
      ['Sensitive Data Usage', 'No Human Oversight', 'Unclear Legal Basis'].includes(risk)
    )) {
      riskTier = 'High';
    } else if (parsed.detectedRisks.some((risk: string) => 
      ['Lack of Fairness Explanation', 'Missing Documentation'].includes(risk)
    )) {
      riskTier = 'Medium';
    }

    return {
      aiActStatus: parsed.aiActStatus,
      detectedRisks: parsed.detectedRisks || [],
      riskTier,
    };
  } catch (error) {
    console.error('AI classification error:', error);
    // Fallback classification
    return {
      aiActStatus: 'Unregulated',
      detectedRisks: [],
      riskTier: 'Low',
    };
  }
}

export function detectRisksFromText(text: string): string[] {
  const rules = {
    "Sensitive Data Usage": [/\bbiometric\b/i, /\bemotion\b/i, /\bface\b/i, /\bpersonal\b/i],
    "No Human Oversight": [/\bautomated\b/i, /\bno human\b/i, /\bfully autonomous\b/i],
    "Unclear Legal Basis": [/\bno consent\b/i, /\blacks lawful\b/i, /\billegal\b/i],
    "Lack of Fairness Explanation": [/\bbias\b/i, /\bno explanation\b/i, /\bunfair\b/i],
    "Missing Documentation": [/\bno model card\b/i, /\bmissing assessment\b/i, /\bundocumented\b/i],
    "No Performance Metrics": [/\bno metrics\b/i, /\bunknown accuracy\b/i, /\bno testing\b/i],
  };

  const detected: string[] = [];
  
  Object.entries(rules).forEach(([riskType, patterns]) => {
    const hasRisk = patterns.some(pattern => pattern.test(text));
    if (hasRisk) {
      detected.push(riskType);
    }
  });

  return detected;
}