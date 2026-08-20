import * as fs from 'fs';
import * as path from 'path';
import mammoth from 'mammoth';
import { OpenAI } from 'openai';
import { db } from './db';
import { documentAnalyses, insertDocumentAnalysisSchema } from '@shared/schema';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface RiskDetection {
  chunk: string;
  risk_category: string;
  explanation: string;
}

export interface AnalysisResult {
  extracted_text: string;
  detections: RiskDetection[];
  overall_risk: 'High' | 'Medium' | 'Low' | 'None';
}

// Updated document analyzer to use simple LLM-based risk detection
async function analyzeDocumentRisk(chunk: string): Promise<RiskDetection> {
  try {
    const prompt = `You are an AI compliance analyst assessing regulatory risks in AI system documentation.

Classify the following document excerpt under one of these EU AI Act categories:
- Prohibited
- High-Risk
- Medium-Risk
- Low-Risk
- Unregulated

Use context clues like use of biometrics, emotion analysis, lack of human oversight, lawful basis, or profiling.

Excerpt:
"""${chunk}"""

Respond in the format: Risk Category: <one of the 5 labels> with a 1-line explanation.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0
    });

    const content = response.choices[0].message.content?.trim() || "";
    
    if (content.includes("Risk Category:")) {
      const parts = content.split("Risk Category:")[1];
      const category = parts.split(' ')[0];
      const explanation = parts.substring(category.length).trim();
      
      return {
        chunk,
        risk_category: category,
        explanation
      };
    }
    
    return {
      chunk,
      risk_category: "Unregulated",
      explanation: "No specific risk detected"
    };
  } catch (error) {
    console.error('Error analyzing document risk:', error);
    return {
      chunk,
      risk_category: "Unregulated",
      explanation: "Analysis failed"
    };
  }
}

async function extractPdfText(filePath: string): Promise<string> {
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const dataBuffer = await fs.promises.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF extraction failed:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

export async function extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
  try {
    if (mimeType === 'application/pdf') {
      return await extractPdfText(filePath);
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               mimeType === 'application/msword') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Error extracting text:', error);
    throw new Error('Failed to extract text from document');
  }
}

function assignOverallRisk(detections: RiskDetection[]): 'High' | 'Medium' | 'Low' | 'None' {
  console.log('Assigning overall risk from detections:', detections.map(d => ({ 
    category: d.risk_category, 
    explanation: d.explanation.substring(0, 100) 
  })));
  
  let hasHighRisk = false;
  let hasMediumRisk = false;
  let hasLowRisk = false;
  
  detections.forEach(detection => {
    const category = detection.risk_category.toLowerCase();
    const explanation = detection.explanation.toLowerCase();
    
    // Check both category and explanation for risk indicators
    if (category.includes('prohibited') || explanation.includes('prohibited')) {
      hasHighRisk = true;
    } else if (category.includes('high') || explanation.includes('high-risk')) {
      hasHighRisk = true;
    } else if (category.includes('medium') || explanation.includes('medium-risk')) {
      hasMediumRisk = true;
    } else if (category.includes('low') || explanation.includes('low-risk')) {
      hasLowRisk = true;
    }
  });
  
  let overallRisk: 'High' | 'Medium' | 'Low' | 'None' = 'None';
  if (hasHighRisk) {
    overallRisk = 'High';
  } else if (hasMediumRisk) {
    overallRisk = 'Medium';
  } else if (hasLowRisk) {
    overallRisk = 'Low';
  }
  
  console.log('Overall risk assigned:', overallRisk);
  return overallRisk;
}

export async function analyzeDocument(filePath: string, mimeType: string): Promise<AnalysisResult> {
  console.log(`Analyzing document: ${path.basename(filePath)}, type: ${mimeType}`);
  
  try {
    // Extract text from document
    const extractedText = await extractTextFromFile(filePath, mimeType);
    
    // Split text into chunks (simple paragraph splitting)
    const chunks = extractedText.split('\n\n').filter(chunk => chunk.trim().length > 0);
    
    // Analyze each chunk
    const detections: RiskDetection[] = [];
    
    for (const chunk of chunks) {
      if (chunk.trim().length > 50) { // Only analyze substantial chunks
        const detection = await analyzeDocumentRisk(chunk);
        detections.push(detection);
      }
    }
    
    // Determine overall risk
    const overallRisk = assignOverallRisk(detections);
    
    return {
      extracted_text: extractedText,
      detections,
      overall_risk: overallRisk
    };
  } catch (error) {
    console.error('Error analyzing document:', error);
    throw new Error('Failed to analyze document');
  }
}

export async function saveDocumentAnalysis(
  userId: number,
  fileName: string,
  fileType: string,
  analysisResult: AnalysisResult
): Promise<void> {
  try {
    // Limit data lengths for database storage
    const truncatedFileName = fileName.length > 200 ? fileName.substring(0, 200) + '...' : fileName;
    const truncatedFileType = fileType.length > 100 ? fileType.substring(0, 100) : fileType;
    
    const documentAnalysis = insertDocumentAnalysisSchema.parse({
      userId,
      fileName: truncatedFileName,
      fileType: truncatedFileType,
      extractedText: analysisResult.extracted_text.substring(0, 50000), // Limit extracted text length
      detections: analysisResult.detections,
      overallRisk: analysisResult.overall_risk
    });

    await db.insert(documentAnalyses).values(documentAnalysis);
  } catch (error) {
    console.error('Error saving document analysis:', error);
    throw new Error('Failed to save document analysis');
  }
}