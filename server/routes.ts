import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { analyzeDocument, saveDocumentAnalysis } from "./document-analyzer";
import { 
  insertUserSchema,
  insertRiskAssessmentSchema,
  insertModuleUsageSchema,
  insertFeedbackSchema,
  insertBiasChecklistSchema,
  insertExplainabilityPlanSchema,
  insertComplianceRoadmapSchema,
  insertTemplateDownloadSchema,
  insertClickHeatmapSchema,
  insertResourceAccessSchema,
  insertAiModelClassificationSchema,
  insertRiskLevelEditSchema,
  clientDataInputSchema,
  type ClientDataInput
} from "@shared/schema";
import { classifyAiModel, detectRisksFromText } from "./ai-model-classifier";
import { parse } from "csv-parse";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
    }
  }
});

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);
      
      res.json({ 
        token, 
        user: { id: user.id, username: user.username, email: user.email } 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);
      
      res.json({ 
        token, 
        user: { id: user.id, username: user.username, email: user.email } 
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/me", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ id: user.id, username: user.username, email: user.email });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Risk assessment routes
  app.post("/api/risk-assessments", authenticateToken, async (req: any, res) => {
    try {
      const assessmentData = insertRiskAssessmentSchema.parse({
        ...req.body,
        userId: req.user.userId,
      });
      
      const assessment = await storage.createRiskAssessment(assessmentData);
      res.json(assessment);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.get("/api/risk-assessments", authenticateToken, async (req: any, res) => {
    try {
      const assessments = await storage.getRiskAssessmentsByUserId(req.user.userId);
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Module usage routes
  app.post("/api/module-usage", authenticateToken, async (req: any, res) => {
    try {
      const usageData = insertModuleUsageSchema.parse({
        ...req.body,
        userId: req.user.userId,
      });
      
      const usage = await storage.createModuleUsage(usageData);
      res.json(usage);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.get("/api/module-usage", authenticateToken, async (req: any, res) => {
    try {
      const usage = await storage.getModuleUsageByUserId(req.user.userId);
      res.json(usage);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Feedback routes
  app.post("/api/feedback", authenticateToken, async (req: any, res) => {
    try {
      const feedbackData = insertFeedbackSchema.parse({
        ...req.body,
        userId: req.user.userId,
      });
      
      const feedback = await storage.createFeedback(feedbackData);
      res.json(feedback);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Bias checklist routes
  app.post("/api/bias-checklist", authenticateToken, async (req: any, res) => {
    try {
      const checklistData = insertBiasChecklistSchema.parse({
        ...req.body,
        userId: req.user.userId,
      });
      
      const checklist = await storage.upsertBiasChecklist(checklistData);
      res.json(checklist);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.get("/api/bias-checklist", authenticateToken, async (req: any, res) => {
    try {
      const checklist = await storage.getBiasChecklistByUserId(req.user.userId);
      res.json(checklist);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Explainability plan routes
  app.post("/api/explainability-plan", authenticateToken, async (req: any, res) => {
    try {
      const planData = insertExplainabilityPlanSchema.parse({
        ...req.body,
        userId: req.user.userId,
      });
      
      const plan = await storage.upsertExplainabilityPlan(planData);
      res.json(plan);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.get("/api/explainability-plan", authenticateToken, async (req: any, res) => {
    try {
      const plan = await storage.getExplainabilityPlanByUserId(req.user.userId);
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Compliance roadmap routes
  app.post("/api/compliance-roadmap", authenticateToken, async (req: any, res) => {
    try {
      const roadmapData = insertComplianceRoadmapSchema.parse({
        ...req.body,
        userId: req.user.userId,
      });
      
      const roadmap = await storage.upsertComplianceRoadmap(roadmapData);
      res.json(roadmap);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.get("/api/compliance-roadmap", authenticateToken, async (req: any, res) => {
    try {
      const roadmap = await storage.getComplianceRoadmapByUserId(req.user.userId);
      res.json(roadmap);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Template downloads
  app.post("/api/template-downloads", authenticateToken, async (req: any, res) => {
    try {
      const downloadData = insertTemplateDownloadSchema.parse({
        ...req.body,
        userId: req.user.userId,
      });
      
      const download = await storage.createTemplateDownload(downloadData);
      
      // Record resource access
      await storage.recordResourceAccess(req.user.userId, 'template', req.body.templateName);
      
      res.json(download);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Dashboard metrics
  app.get("/api/dashboard-metrics", authenticateToken, async (req: any, res) => {
    try {
      const metrics = await storage.getUserDashboardMetrics(req.user.userId);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Session tracking
  app.post("/api/sessions/start", authenticateToken, async (req: any, res) => {
    try {
      const session = await storage.startUserSession(req.user.userId);
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/sessions/:sessionId/end", authenticateToken, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const session = await storage.endUserSession(sessionId);
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/sessions", authenticateToken, async (req: any, res) => {
    try {
      const sessions = await storage.getUserSessions(req.user.userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Click heatmap
  app.post("/api/analytics/clicks", authenticateToken, async (req: any, res) => {
    try {
      const { page, elementId, elementType } = req.body;
      await storage.recordClick(req.user.userId, page, elementId, elementType);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/analytics/heatmap", authenticateToken, async (req: any, res) => {
    try {
      const heatmap = await storage.getClickHeatmap(req.user.userId);
      res.json(heatmap);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/analytics/heatmap/all", authenticateToken, async (req: any, res) => {
    try {
      const heatmap = await storage.getAllClickHeatmap();
      res.json(heatmap);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Resource access analytics
  app.get("/api/analytics/resources/most-accessed", authenticateToken, async (req: any, res) => {
    try {
      const resources = await storage.getMostAccessedResources();
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/analytics/resources/user", authenticateToken, async (req: any, res) => {
    try {
      const resources = await storage.getUserResourceAccess(req.user.userId);
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/analytics/visitors", authenticateToken, async (req: any, res) => {
    try {
      const daysParam = req.query.days;
      const days = daysParam === 'all' || daysParam == null ? null : parseInt(daysParam as string, 10);
      const stats = await storage.getVisitorStats(days);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // GDPR Risk Assessment
  app.post("/api/risk-assessment", authenticateToken, async (req: any, res) => {
    try {
      const clientData: ClientDataInput = clientDataInputSchema.parse(req.body);
      
      // Define sensitive keywords
      const sensitiveKeywords = [
        'cancer', 'disability', 'ethnicity', 'race', 'religion', 'sexual orientation',
        'political opinion', 'trade union', 'genetic', 'biometric', 'mental health',
        'addiction', 'pregnancy', 'medical condition', 'chronic illness', 'depression',
        'anxiety', 'bipolar', 'psychiatric', 'therapy', 'medication', 'substance abuse'
      ];
      
      // Check for sensitive data in financial behavior
      const behaviorText = clientData.financialBehavior.toLowerCase();
      
      const foundSensitiveKeywords = sensitiveKeywords.filter(keyword => 
        behaviorText.includes(keyword)
      );
      
      const hasSensitiveData = foundSensitiveKeywords.length > 0;
      
      // Determine risk level
      let riskLevel: 'Low' | 'Medium' | 'High';
      const reasons: string[] = [];
      const recommendations: string[] = [];
      
      if (clientData.usesAI && hasSensitiveData) {
        riskLevel = 'High';
        reasons.push('Sensitive data detected in AI processing');
        reasons.push('Automated decision-making enabled');
        if (foundSensitiveKeywords.length > 0) {
          reasons.push(`Sensitive keywords found: ${foundSensitiveKeywords.join(', ')}`);
        }
        recommendations.push('Conduct Data Protection Impact Assessment (DPIA)');
        recommendations.push('Implement human-in-the-loop review process');
        recommendations.push('Ensure explicit consent for sensitive data processing');
        recommendations.push('Apply additional security measures');
      } else if (clientData.usesAI && !hasSensitiveData) {
        riskLevel = 'Medium';
        reasons.push('Automated decision-making enabled');
        reasons.push('Regular personal data processing in AI system');
        recommendations.push('Implement transparency measures');
        recommendations.push('Provide clear information about automated processing');
        recommendations.push('Enable data subject rights (access, rectification, erasure)');
      } else {
        riskLevel = 'Low';
        reasons.push('No automated decision-making');
        if (hasSensitiveData) {
          reasons.push('Sensitive data present but not used in AI');
          recommendations.push('Ensure appropriate security measures for sensitive data');
        }
        recommendations.push('Maintain standard data protection practices');
        recommendations.push('Regular privacy policy updates');
      }
      
      // Log the assessment for tracking - using proper schema fields
      await storage.createRiskAssessment({
        userId: req.user.userId,
        title: `GDPR Assessment for ${clientData.name}`,
        dataType: hasSensitiveData ? 'Sensitive Personal Data' : 'Personal Data',
        automationLevel: clientData.usesAI ? 'High' : 'Low',
        riskLevel: riskLevel,
        responses: JSON.stringify({
          clientData,
          reasons,
          recommendations,
          sensitiveKeywords: foundSensitiveKeywords
        })
      });
      
      res.json({
        riskLevel,
        reasons,
        recommendations,
        sensitiveDataDetected: hasSensitiveData,
        sensitiveKeywords: foundSensitiveKeywords
      });
      
    } catch (error: any) {
      console.error('Risk assessment error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // AI Act chat integration route
  app.post("/api/regulation-chat", authenticateToken, async (req: any, res) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: "Message is required" });
      }

      // Import AI Act analyzer functions
      const { queryAIAct } = await import("./ai-act-analyzer");
      
      // Determine the best module based on message content
      let module: 'regulation-translator' | 'risk-assessment' | 'bias-fairness' = 'regulation-translator';
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('risk') || lowerMessage.includes('high-risk') || lowerMessage.includes('assessment')) {
        module = 'risk-assessment';
      } else if (lowerMessage.includes('bias') || lowerMessage.includes('fairness') || lowerMessage.includes('discrimination')) {
        module = 'bias-fairness';
      }
      
      const result = await queryAIAct(message, module);
      
      res.json({
        response: result.answer,
        sources: result.sources,
        relevantArticles: result.relevantArticles,
        module: module
      });
    } catch (error) {
      console.error("Error in regulation chat:", error);
      res.status(500).json({ 
        error: "I'm having trouble accessing the EU AI Act document right now. Please try again later.",
        response: "I apologize, but I'm currently unable to process your question about EU regulations. Please try asking again in a moment."
      });
    }
  });

  // Document analysis route
  app.post("/api/analyze-document", authenticateToken, upload.single('document'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No document uploaded' });
      }

      const filePath = req.file.path;
      const mimeType = req.file.mimetype;
      const userId = req.user.userId;

      console.log(`Analyzing document: ${req.file.originalname}, type: ${mimeType}`);

      const result = await analyzeDocument(filePath, mimeType);

      // Save analysis result to database
      await saveDocumentAnalysis(userId, req.file.originalname, mimeType, result);

      // Clean up uploaded file
      try {
        await fs.promises.unlink(filePath);
      } catch (cleanupError) {
        console.warn('Could not clean up uploaded file:', cleanupError);
      }

      res.json(result);
    } catch (error) {
      console.error("Error analyzing document:", error);
      
      // Clean up uploaded file in case of error
      if (req.file) {
        try {
          await fs.promises.unlink(req.file.path);
        } catch (cleanupError) {
          console.warn('Could not clean up uploaded file after error:', cleanupError);
        }
      }
      
      res.status(500).json({ 
        error: "Failed to analyze document. Please ensure the file is a valid PDF or Word document and try again."
      });
    }
  });

  // AI Model Classification routes
  app.post("/api/ai-model-classifications", authenticateToken, async (req: any, res) => {
    try {
      const classificationData = insertAiModelClassificationSchema.parse(req.body);
      
      // Classify the AI model using Claude
      const classification = await classifyAiModel(
        classificationData.purpose,
        classificationData.useCaseType,
        classificationData.inputData
      );
      
      // Add detected risks from rule-based detection
      const combinedText = `${classificationData.purpose} ${classificationData.useCaseType} ${classificationData.inputData || ''} ${classificationData.legalNotes || ''}`;
      const ruleBasedRisks = detectRisksFromText(combinedText);
      const allRisks = [...new Set([...classification.detectedRisks, ...ruleBasedRisks])];
      
      // Create the classification record
      const result = await storage.createAiModelClassification({
        ...classificationData,
        userId: req.user.userId,
        aiActStatus: classification.aiActStatus,
        riskTier: classification.riskTier,
        detectedRisks: allRisks,
      });
      
      res.json(result);
    } catch (error: any) {
      console.error('AI model classification error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/ai-model-classifications", authenticateToken, async (req: any, res) => {
    try {
      const classifications = await storage.getAiModelClassificationsByUserId(req.user.userId);
      res.json(classifications);
    } catch (error: any) {
      console.error('Error fetching AI model classifications:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/ai-model-classifications/stats", authenticateToken, async (req: any, res) => {
    try {
      const stats = await storage.getAiModelClassificationStats(req.user.userId);
      res.json(stats);
    } catch (error: any) {
      console.error('Error fetching AI model classification stats:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/ai-model-classifications/departments", authenticateToken, async (req: any, res) => {
    try {
      const departments = await storage.getAiModelClassificationsByDepartment(req.user.userId);
      res.json(departments);
    } catch (error: any) {
      console.error('Error fetching AI model classifications by department:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // CSV upload handler for AI model classifications
  const csvUpload = multer({
    dest: 'uploads/',
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'text/csv') {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only CSV files are allowed.'));
      }
    }
  });

  app.post("/api/ai-model-classifications/csv", authenticateToken, csvUpload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No CSV file uploaded' });
      }

      const filePath = req.file.path;
      const fileContent = await fs.promises.readFile(filePath, 'utf8');
      
      const records: any[] = [];
      const parser = parse({
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
      
      parser.on('readable', function() {
        let record;
        while (record = parser.read()) {
          records.push(record);
        }
      });
      
      parser.on('error', function(err) {
        throw err;
      });
      
      parser.write(fileContent);
      parser.end();
      
      let processedCount = 0;
      const errors: string[] = [];
      
      for (const record of records) {
        try {
          // Map CSV columns to our schema
          const modelData = {
            modelName: record.model_name || record.modelName || record['Model Name'],
            department: record.department || record.Department,
            modelOwner: record.model_owner || record.modelOwner || record['Model Owner'],
            purpose: record.purpose || record.Purpose,
            useCaseType: record.use_case_type || record.useCaseType || record['Use Case Type'],
            inputData: record.input_data || record.inputData || record['Input Data'],
            riskTier: record.risk_tier || record.riskTier || record['Risk Tier'] || 'Low',
            legalNotes: record.legal_notes || record.legalNotes || record['Legal Notes'],
          };
          
          // Validate required fields
          if (!modelData.modelName || !modelData.purpose || !modelData.useCaseType) {
            errors.push(`Row ${processedCount + 1}: Missing required fields (model_name, purpose, use_case_type)`);
            continue;
          }
          
          // Classify the AI model
          const classification = await classifyAiModel(
            modelData.purpose,
            modelData.useCaseType,
            modelData.inputData
          );
          
          // Detect risks from text
          const combinedText = `${modelData.purpose} ${modelData.useCaseType} ${modelData.inputData || ''} ${modelData.legalNotes || ''}`;
          const ruleBasedRisks = detectRisksFromText(combinedText);
          const allRisks = [...new Set([...classification.detectedRisks, ...ruleBasedRisks])];
          
          // Create the classification record
          await storage.createAiModelClassification({
            ...modelData,
            userId: req.user.userId,
            aiActStatus: classification.aiActStatus,
            riskTier: classification.riskTier,
            detectedRisks: allRisks,
          });
          
          processedCount++;
        } catch (error: any) {
          errors.push(`Row ${processedCount + 1}: ${error.message}`);
        }
      }
      
      // Clean up uploaded file
      try {
        await fs.promises.unlink(filePath);
      } catch (cleanupError) {
        console.warn('Could not clean up uploaded CSV file:', cleanupError);
      }
      
      res.json({
        count: processedCount,
        errors: errors.length > 0 ? errors : undefined,
        message: `Successfully processed ${processedCount} AI models${errors.length > 0 ? ` with ${errors.length} errors` : ''}`
      });
      
    } catch (error: any) {
      console.error('CSV processing error:', error);
      
      // Clean up uploaded file in case of error
      if (req.file) {
        try {
          await fs.promises.unlink(req.file.path);
        } catch (cleanupError) {
          console.warn('Could not clean up uploaded CSV file after error:', cleanupError);
        }
      }
      
      res.status(500).json({ 
        error: "Failed to process CSV file. Please check the format and try again." 
      });
    }
  });

  // Document analysis dashboard routes
  app.get("/api/document-analyses", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.userId;
      const analyses = await storage.getDocumentAnalysesByUserId(userId);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching document analyses:", error);
      res.status(500).json({ error: "Failed to fetch document analyses" });
    }
  });

  app.get("/api/document-analyses/stats", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.userId;
      const stats = await storage.getDocumentAnalysisStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching document analysis stats:", error);
      res.status(500).json({ error: "Failed to fetch document analysis stats" });
    }
  });

  // Risk level editing routes
  app.patch("/api/ai-models/:id/risk-level", authenticateToken, async (req: any, res) => {
    try {
      const modelId = parseInt(req.params.id);
      const userId = req.user.userId;
      const { newRiskLevel, newAiActStatus, comment } = req.body;
      
      if (!newRiskLevel || !newAiActStatus || !comment) {
        return res.status(400).json({ error: "New risk level, AI Act status, and comment are required" });
      }

      // Get the current model data
      const currentModel = await storage.getAiModelClassificationById(modelId);
      if (!currentModel || currentModel.userId !== userId) {
        return res.status(404).json({ error: "Model not found or access denied" });
      }

      // Create audit trail entry
      const editData = insertRiskLevelEditSchema.parse({
        modelId,
        userId,
        previousRiskLevel: currentModel.riskTier,
        newRiskLevel,
        previousAiActStatus: currentModel.aiActStatus,
        newAiActStatus,
        comment
      });

      await storage.createRiskLevelEdit(editData);

      // Update the model
      await storage.updateAiModelClassification(modelId, {
        riskTier: newRiskLevel,
        aiActStatus: newAiActStatus,
        updatedAt: new Date()
      });

      res.json({ message: "Risk level updated successfully" });
    } catch (error) {
      console.error("Error updating risk level:", error);
      res.status(500).json({ error: "Failed to update risk level" });
    }
  });

  app.get("/api/ai-models/:id/risk-history", authenticateToken, async (req: any, res) => {
    try {
      const modelId = parseInt(req.params.id);
      const userId = req.user.userId;
      
      // Verify the user owns this model
      const model = await storage.getAiModelClassificationById(modelId);
      if (!model || model.userId !== userId) {
        return res.status(404).json({ error: "Model not found or access denied" });
      }

      const history = await storage.getRiskLevelEditsByModelId(modelId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching risk level history:", error);
      res.status(500).json({ error: "Failed to fetch risk level history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
