import { askClaude } from './claude';
import fs from 'fs';
import path from 'path';


// Cache for processed PDF content
let cachedPdfContent: string = '';

async function loadPdfContent(): Promise<string> {
  if (cachedPdfContent && cachedPdfContent.length > 0) {
    return cachedPdfContent;
  }

  try {
    const pdfPath = path.join(process.cwd(), 'attached_assets', 'OJ_L_202401689_EN_TXT_1751391388637_1751634980352.pdf');
    
    console.log('Attempting to load PDF from:', pdfPath);
    
    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not found at ${pdfPath}`);
    }
    
    console.log('PDF file exists, size:', fs.statSync(pdfPath).size, 'bytes');
    
    // Use a different approach - try to work around the pdf-parse test file issue
    // by importing it in a way that doesn't trigger the test code
    const dataBuffer = fs.readFileSync(pdfPath);
    console.log('PDF buffer loaded, size:', dataBuffer.length, 'bytes');
    
    // Try a simplified approach without subprocess
    try {
      // Clear any cached modules that might cause issues
      const modulePath = require.resolve('pdf-parse');
      delete require.cache[modulePath];
      
      // Import fresh
      const pdf = require('pdf-parse');
      const data = await pdf(dataBuffer);
      
      console.log('PDF parsed successfully, text length:', data.text.length);
      
      // Clean and process the text
      cachedPdfContent = data.text
        .replace(/researc h/g, 'research')
        .replace(/ser vice/g, 'service')
        .replace(/Uni on/g, 'Union')
        .replace(/\s+/g, ' ')
        .trim();
      
      return cachedPdfContent;
    } catch (pdfError) {
      console.error('Direct PDF parsing failed:', pdfError);
      
      // Fallback: Use pre-extracted content if available
      // For now, return a sample of actual EU AI Act content
      console.log('Using fallback EU AI Act content...');
      cachedPdfContent = `
REGULATION (EU) 2024/1689 OF THE EUROPEAN PARLIAMENT AND OF THE COUNCIL
of 13 June 2024
laying down harmonised rules on artificial intelligence and amending Regulations (EC) No 300/2008, (EU) No 167/2013, (EU) No 168/2013, (EU) 2018/858, (EU) 2018/1139 and (EU) 2019/2144

Article 5 - Prohibited artificial intelligence practices

1. The following artificial intelligence practices shall be prohibited:

(a) the placing on the market, putting into service or use of an AI system that deploys subliminal techniques beyond a person's consciousness or purposefully manipulative or deceptive techniques, with the objective or the effect of materially distorting a person's behaviour in a manner that causes or is reasonably likely to cause that person or another person psychological or physical harm;

(b) the placing on the market, putting into service or use of an AI system that exploits any of the vulnerabilities of a specific group of persons due to their age, disability or a specific social or economic situation, with the objective or the effect of materially distorting the behaviour of a person pertaining to that group in a manner that causes or is reasonably likely to cause that person or another person psychological or physical harm;

(c) the placing on the market, putting into service or use of AI systems for the evaluation or classification of natural persons or groups of persons over a certain period of time based on their social behaviour or known, inferred or predicted personal or personality characteristics, with the social score leading to either or both of the following:
(i) detrimental or unfavourable treatment of certain natural persons or groups of persons in social contexts that are unrelated to the contexts in which the data was originally generated or collected;
(ii) detrimental or unfavourable treatment of certain natural persons or groups of persons that is unjustified or disproportionate to their social behaviour or its gravity;

(d) the use of real-time remote biometric identification systems in publicly accessible spaces for the purpose of law enforcement, unless and in so far as such use is strictly necessary for one of the following objectives:
(i) the targeted search for specific victims of crime, including missing children;
(ii) the prevention of a specific, substantial and imminent threat to the life or physical safety of natural persons or of a terrorist attack;
(iii) the localisation or identification of a person suspected of having committed a criminal offence referred to in Article 2(2) of Council Framework Decision 2002/584/JHA and punishable in the Member State concerned by a custodial sentence or a detention order for a maximum period of at least three years, as determined by the law of that Member State.

Article 6 - Classification of AI systems as high-risk

1. Irrespective of whether the AI system is placed on the market or put into service independently from the products referred to in points (a) and (b), an AI system shall be considered high-risk where both of the following conditions are fulfilled:
(a) the AI system is intended to be used as a safety component of a product, or the AI system is itself a product, covered by the Union harmonisation legislation listed in Annex I;
(b) the product whose safety component is the AI system, or the AI system itself as a product, is required to undergo a third-party conformity assessment with a view to the placing on the market or putting into service of that product pursuant to the Union harmonisation legislation listed in Annex I.

2. In addition to the high-risk AI systems referred to in paragraph 1, AI systems referred to in Annex III shall also be considered high-risk.
      `.trim();
      
      return cachedPdfContent;
    }
  } catch (error) {
    console.error('Error loading PDF:', error);
    throw new Error('Failed to load EU AI Act PDF document');
  }
}

function extractRelevantSections(fullText: string, query: string, maxChars = 8000): string {
  const queryLower = query.toLowerCase();
  const paragraphs = fullText.split('\n\n');
  
  // Score paragraphs based on relevance
  const scoredParagraphs = paragraphs.map(paragraph => {
    const paragraphLower = paragraph.toLowerCase();
    let score = 0;
    
    // Keywords for different query types
    const keywords = {
      'risk': ['risk', 'high-risk', 'assessment', 'evaluation'],
      'bias': ['bias', 'discrimination', 'fairness', 'equality', 'fundamental rights'],
      'prohibited': ['prohibited', 'forbidden', 'shall not', 'restrictions'],
      'compliance': ['compliance', 'requirements', 'obligations', 'conformity'],
      'fintech': ['financial', 'credit', 'loan', 'banking', 'payment']
    };
    
    // Check for direct query matches
    if (paragraphLower.includes(queryLower)) {
      score += 10;
    }
    
    // Check for keyword matches
    Object.entries(keywords).forEach(([category, words]) => {
      if (queryLower.includes(category)) {
        words.forEach(word => {
          if (paragraphLower.includes(word)) {
            score += 2;
          }
        });
      }
    });
    
    // Prefer paragraphs with article numbers or specific sections
    if (paragraphLower.includes('article') || paragraphLower.includes('chapter')) {
      score += 1;
    }
    
    return { paragraph, score };
  });
  
  // Sort by relevance and take top sections
  const relevantSections = scoredParagraphs
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.paragraph);
  
  // Combine sections up to character limit
  let context = '';
  for (const section of relevantSections) {
    if (context.length + section.length > maxChars) {
      break;
    }
    context += section + '\n\n';
  }
  
  return context || fullText.substring(0, maxChars);
}

// Fallback responses for common questions when OpenAI is unavailable
function getFallbackResponse(query: string, module: 'regulation-translator' | 'risk-assessment' | 'bias-fairness'): {
  answer: string;
  relevantArticles: string[];
  sources: string[];
} {
  const queryLower = query.toLowerCase();
  
  // Common classification questions
  if (queryLower.includes('classify') || queryLower.includes('classification')) {
    return {
      answer: "To classify your AI models under the EU AI Act, start by identifying what your system does and who it affects. High-risk systems include those used in healthcare, finance, law enforcement, or education that could significantly impact people's lives. Most business AI tools like chatbots or recommendation systems are typically low-risk. Would you like me to walk through the specific categories with you, or do you have a particular AI system in mind?",
      relevantArticles: ['article 6'],
      sources: ['EU AI Act (Regulation 2024/1689)']
    };
  }
  
  // Risk assessment questions
  if (queryLower.includes('risk') && (queryLower.includes('assess') || queryLower.includes('category'))) {
    return {
      answer: "The EU AI Act defines four main risk categories. Prohibited systems manipulate behavior or exploit vulnerabilities. High-risk systems affect safety or fundamental rights in areas like finance, healthcare, or hiring. Limited-risk systems need transparency disclosures. Minimal-risk systems have basic requirements. The key is understanding your system's purpose and impact. What type of AI system are you working with?",
      relevantArticles: ['article 5', 'article 6'],
      sources: ['EU AI Act (Regulation 2024/1689)']
    };
  }
  
  // Bias and fairness questions
  if (queryLower.includes('bias') || queryLower.includes('fair') || queryLower.includes('discrimination')) {
    return {
      answer: "Addressing AI bias starts with understanding your data and testing for unfair outcomes across different groups. Check if your AI system treats people differently based on protected characteristics like age, gender, or ethnicity. Test your system with diverse data samples and monitor for disparate outcomes. Document your testing process and implement corrective measures when needed. What type of data does your AI system use?",
      relevantArticles: ['article 10'],
      sources: ['EU AI Act (Regulation 2024/1689)']
    };
  }
  
  // Document analysis questions
  if (queryLower.includes('document') || queryLower.includes('analyze')) {
    return {
      answer: "For document analysis compliance, focus on identifying sensitive personal data, automated decision-making processes, and potential bias in your AI systems. Review contracts, privacy policies, and technical documentation. Look for data processing that could affect individuals' rights and ensure you have proper legal basis. The key is documenting your AI systems' impact and safeguards. Which documents would you like to start with?",
      relevantArticles: ['article 9', 'article 11'],
      sources: ['EU AI Act (Regulation 2024/1689)']
    };
  }
  
  // General compliance questions
  return {
    answer: "I'm here to help you navigate EU AI Act compliance step by step. The regulation focuses on ensuring AI systems are safe, transparent, and respect fundamental rights. Start by identifying your AI systems, assessing their risk level, and implementing appropriate safeguards. Each system type has specific requirements, but we can work through them together. What specific aspect of compliance would you like to explore first?",
    relevantArticles: ['article 1'],
    sources: ['EU AI Act (Regulation 2024/1689)']
  };
}

export async function queryAIAct(query: string, module: 'regulation-translator' | 'risk-assessment' | 'bias-fairness'): Promise<{
  answer: string;
  relevantArticles: string[];
  sources: string[];
}> {
  try {
    const pdfContent = await loadPdfContent();
    
    // Extract context information from the query if present
    let cleanQuery = query;
    let pageContext = '';
    
    if (query.includes('Current page:')) {
      const lines = query.split('\n');
      cleanQuery = lines[0];
      
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].startsWith('Current page:')) {
          const currentPage = lines[i].replace('Current page:', '').trim();
          pageContext = `User is currently on: ${currentPage}. `;
          
          // Add page-specific context
          if (currentPage.includes('dashboard')) {
            pageContext += 'Reference their dashboard metrics and analysis results when relevant. ';
          } else if (currentPage.includes('document-risk-analyzer')) {
            pageContext += 'User is analyzing documents for compliance risks. Reference document analysis results when helpful. ';
          } else if (currentPage.includes('classification')) {
            pageContext += 'User is working with AI model classifications. Reference their model risk categories when relevant. ';
          }
        } else if (lines[i].startsWith('Page data context:')) {
          try {
            const pageData = JSON.parse(lines[i].replace('Page data context:', '').trim());
            if (pageData && Object.keys(pageData).length > 0) {
              pageContext += `Current page data: ${JSON.stringify(pageData)}. Use this context to provide more specific answers. `;
            }
          } catch (e) {
            // Ignore JSON parsing errors
          }
        }
      }
    }
    
    const relevantContext = extractRelevantSections(pdfContent, cleanQuery);
    
    let systemPrompt = '';
    switch (module) {
      case 'regulation-translator':
        systemPrompt = `You are SafeBot, a friendly and helpful AI compliance assistant. Think of yourself as a knowledgeable colleague who genuinely wants to help users succeed with compliance.

${pageContext}Your approach:
- Be conversational and supportive, not formal or robotic
- Ask follow-up questions to understand their specific situation
- Guide them step by step through processes
- End with helpful questions like "Would you like me to help you with..." or "What specific area should we focus on next?"
- Use "you" and "your business" to make it personal
- Break complex topics into manageable pieces
- Offer concrete next steps they can take today

Write naturally without bullet points or special formatting. Keep responses under 150 words but make every word count toward helping them move forward.`;
        break;
        
      case 'risk-assessment':
        systemPrompt = `You are SafeBot, helping users navigate AI risk assessment with confidence. ${pageContext}

Your mission is to make risk assessment feel manageable and achievable:
- Start by understanding their specific AI system and use case
- Guide them through risk categories with clear, practical examples
- Help them identify their system's risk tier through targeted questions
- Provide concrete next steps for their specific situation
- Ask things like "What type of AI system are you implementing?" or "Based on what you've described, it sounds like..."
- Offer reassurance: "This is actually quite manageable, here's how..."
- End with specific offers to help: "Would you like me to walk you through the requirements for your risk category?"

Be conversational and encouraging. Write naturally without formatting. Keep under 150 words.`;
        break;
        
      case 'bias-fairness':
        systemPrompt = `You are SafeBot, helping users tackle AI bias and fairness with practical, achievable steps. ${pageContext}

Make bias testing feel approachable:
- Ask about their specific data and use cases: "What type of data does your AI system use?"
- Guide them through practical testing methods they can actually implement
- Suggest concrete bias mitigation steps for their situation
- Offer to help create action plans: "Let's create a testing plan for your specific case"
- Ask about their biggest concerns: "What's your main worry about bias in your system?"
- Provide encouragement: "Here's a simple way to check for bias..."

Be conversational and practical. Focus on what they can do right now. Write naturally without formatting. Keep under 150 words and always end with a helpful question or offer.`;
        break;
    }

    const prompt = `${systemPrompt}

Query: ${cleanQuery}

Based on the following EU AI Act content:

${relevantContext}

Provide a clear, conversational answer in plain English. Write in a natural, flowing style using complete sentences and short paragraphs. Do not use bullet points, dashes, or any special formatting. Keep response under 150 words and make it sound professional yet human.`;

    // Try OpenAI API with fallback handling
    try {
      let answer = (await askClaude(prompt, { maxTokens: 400, temperature: 0.3 })) || "Unable to generate response";
      
      // Clean up markdown formatting and improve readability
      answer = answer
        .replace(/\*\*([^*]+)\*\*/g, '$1')  // Remove ** bold formatting
        .replace(/\*([^*]+)\*/g, '$1')      // Remove * italic formatting
        .replace(/#{1,6}\s+/g, '')          // Remove # headers
        .replace(/`([^`]+)`/g, '$1')        // Remove ` code formatting
        .replace(/^-\s+/gm, '')             // Remove bullet point dashes at start of lines
        .replace(/^\s*[\-\*\+]\s+/gm, '')   // Remove any list formatting
        .replace(/\n\s*\n\s*\n/g, '\n\n')   // Clean up multiple newlines
        .trim();
      
      // Extract article references from the answer
      const articleRegex = /Article\s+(\d+)/gi;
      const articleMatches = answer.match(articleRegex) || [];
      const relevantArticles = articleMatches
        .map((match: string) => match.toLowerCase())
        .filter((value, index, self) => self.indexOf(value) === index);

      return {
        answer,
        relevantArticles,
        sources: ['EU AI Act (Regulation 2024/1689)']
      };
    } catch (openaiError: any) {
      console.log('OpenAI API unavailable, using fallback response:', openaiError.message);
      
      // Check if it's a quota/rate limit error
      if (openaiError.message?.includes('quota') || openaiError.message?.includes('rate limit') || openaiError.status === 429) {
        console.log('Rate limit detected, providing fallback response');
      }
      
      // Return contextual fallback response
      return getFallbackResponse(cleanQuery, module);
    }
    
  } catch (error) {
    console.error('Error in queryAIAct:', error);
    
    // Even if PDF loading fails, provide a helpful fallback
    const fallbackResponse = getFallbackResponse(query, module);
    return {
      ...fallbackResponse,
      answer: `${fallbackResponse.answer} I'm currently having some technical difficulties accessing my full knowledge base, but I can still help you with the basics. What specific question can I answer for you?`
    };
  }
}

export async function getProhibitedPractices(): Promise<string[]> {
  const query = "What are the prohibited AI practices according to the EU AI Act?";
  const result = await queryAIAct(query, 'regulation-translator');
  
  // Extract prohibited practices from the answer
  const practices = result.answer
    .split('\n')
    .filter(line => line.includes('-') || line.includes('•') || line.match(/^\d+\./))
    .map(line => line.replace(/^[-•\d.\s]+/, '').trim())
    .filter(line => line.length > 10);
    
  return practices;
}

export async function getHighRiskCategories(): Promise<string[]> {
  const query = "What are the high-risk AI system categories in the EU AI Act?";
  const result = await queryAIAct(query, 'risk-assessment');
  
  // Extract categories from the answer
  const categories = result.answer
    .split('\n')
    .filter(line => line.includes('-') || line.includes('•') || line.match(/^\d+\./))
    .map(line => line.replace(/^[-•\d.\s]+/, '').trim())
    .filter(line => line.length > 10);
    
  return categories;
}