import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const riskAssessments = pgTable("risk_assessments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  dataType: text("data_type").notNull(),
  automationLevel: text("automation_level").notNull(),
  riskLevel: text("risk_level").notNull(), // LOW, MEDIUM, HIGH
  responses: jsonb("responses").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const moduleUsage = pgTable("module_usage", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  moduleName: text("module_name").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  moduleName: text("module_name"),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const biasChecklists = pgTable("bias_checklists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  diverseData: boolean("diverse_data").default(false),
  biasTesting: boolean("bias_testing").default(false),
  fairnessMetrics: boolean("fairness_metrics").default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const explainabilityPlans = pgTable("explainability_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  systemOwner: text("system_owner"),
  auditResponsibility: text("audit_responsibility"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const complianceRoadmaps = pgTable("compliance_roadmaps", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  dataInventory: boolean("data_inventory").default(false),
  riskAssessmentComplete: boolean("risk_assessment_complete").default(false),
  documentation: boolean("documentation").default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const templateDownloads = pgTable("template_downloads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  templateName: text("template_name").notNull(),
  downloadedAt: timestamp("downloaded_at").defaultNow().notNull(),
});

export const aiModelClassifications = pgTable("ai_model_classifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  modelName: text("model_name").notNull(),
  department: text("department"),
  modelOwner: text("model_owner"),
  purpose: text("purpose").notNull(),
  useCaseType: text("use_case_type").notNull(),
  inputData: text("input_data"),
  riskTier: text("risk_tier").notNull(), // High, Medium, Low
  aiActStatus: text("ai_act_status").notNull(), // Prohibited, High-Risk, Medium-Risk, Low-Risk, Unregulated
  legalNotes: text("legal_notes"),
  detectedRisks: jsonb("detected_risks"), // Array of detected risks
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const documentAnalyses = pgTable("document_analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  extractedText: text("extracted_text").notNull(),
  detections: jsonb("detections").notNull(), // Array of risk detections
  overallRisk: text("overall_risk").notNull(), // High, Medium, Low, None
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const riskLevelEdits = pgTable("risk_level_edits", {
  id: serial("id").primaryKey(),
  modelId: integer("model_id").notNull().references(() => aiModelClassifications.id),
  userId: integer("user_id").notNull().references(() => users.id),
  previousRiskLevel: text("previous_risk_level").notNull(),
  newRiskLevel: text("new_risk_level").notNull(),
  previousAiActStatus: text("previous_ai_act_status").notNull(),
  newAiActStatus: text("new_ai_act_status").notNull(),
  comment: text("comment").notNull(),
  editedAt: timestamp("edited_at").defaultNow().notNull(),
});

export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in seconds
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clickHeatmap = pgTable("click_heatmap", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  page: varchar("page", { length: 255 }).notNull(),
  elementId: varchar("element_id", { length: 255 }),
  elementType: varchar("element_type", { length: 100 }),
  clickCount: integer("click_count").default(1).notNull(),
  lastClickedAt: timestamp("last_clicked_at").defaultNow().notNull(),
});

export const resourceAccess = pgTable("resource_access", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  resourceType: varchar("resource_type", { length: 100 }).notNull(), // 'template', 'tool', 'guide'
  resourceName: varchar("resource_name", { length: 255 }).notNull(),
  accessCount: integer("access_count").default(1).notNull(),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  riskAssessments: many(riskAssessments),
  moduleUsage: many(moduleUsage),
  feedback: many(feedback),
  biasChecklists: many(biasChecklists),
  explainabilityPlans: many(explainabilityPlans),
  complianceRoadmaps: many(complianceRoadmaps),
  templateDownloads: many(templateDownloads),
  userSessions: many(userSessions),
  clickHeatmap: many(clickHeatmap),
  resourceAccess: many(resourceAccess),
  aiModelClassifications: many(aiModelClassifications),
  documentAnalyses: many(documentAnalyses),
  riskLevelEdits: many(riskLevelEdits),
}));

export const riskAssessmentsRelations = relations(riskAssessments, ({ one }) => ({
  user: one(users, {
    fields: [riskAssessments.userId],
    references: [users.id],
  }),
}));

export const moduleUsageRelations = relations(moduleUsage, ({ one }) => ({
  user: one(users, {
    fields: [moduleUsage.userId],
    references: [users.id],
  }),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  user: one(users, {
    fields: [feedback.userId],
    references: [users.id],
  }),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

export const clickHeatmapRelations = relations(clickHeatmap, ({ one }) => ({
  user: one(users, {
    fields: [clickHeatmap.userId],
    references: [users.id],
  }),
}));

export const resourceAccessRelations = relations(resourceAccess, ({ one }) => ({
  user: one(users, {
    fields: [resourceAccess.userId],
    references: [users.id],
  }),
}));

export const aiModelClassificationsRelations = relations(aiModelClassifications, ({ one, many }) => ({
  user: one(users, {
    fields: [aiModelClassifications.userId],
    references: [users.id],
  }),
  riskLevelEdits: many(riskLevelEdits),
}));

export const riskLevelEditsRelations = relations(riskLevelEdits, ({ one }) => ({
  model: one(aiModelClassifications, {
    fields: [riskLevelEdits.modelId],
    references: [aiModelClassifications.id],
  }),
  user: one(users, {
    fields: [riskLevelEdits.userId],
    references: [users.id],
  }),
}));

export const documentAnalysesRelations = relations(documentAnalyses, ({ one }) => ({
  user: one(users, {
    fields: [documentAnalyses.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export const insertRiskAssessmentSchema = createInsertSchema(riskAssessments).omit({
  id: true,
  createdAt: true,
});

export const insertModuleUsageSchema = createInsertSchema(moduleUsage).omit({
  id: true,
  completedAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
});

export const insertBiasChecklistSchema = createInsertSchema(biasChecklists).omit({
  id: true,
  updatedAt: true,
});

export const insertExplainabilityPlanSchema = createInsertSchema(explainabilityPlans).omit({
  id: true,
  updatedAt: true,
});

export const insertComplianceRoadmapSchema = createInsertSchema(complianceRoadmaps).omit({
  id: true,
  updatedAt: true,
});

export const insertTemplateDownloadSchema = createInsertSchema(templateDownloads).omit({
  id: true,
  downloadedAt: true,
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  startTime: true,
  createdAt: true,
});

export const insertClickHeatmapSchema = createInsertSchema(clickHeatmap).pick({
  userId: true,
  page: true,
  elementId: true,
  elementType: true,
});

export const insertResourceAccessSchema = createInsertSchema(resourceAccess).pick({
  userId: true,
  resourceType: true,
  resourceName: true,
});

export const insertAiModelClassificationSchema = createInsertSchema(aiModelClassifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentAnalysisSchema = createInsertSchema(documentAnalyses).omit({
  id: true,
  createdAt: true,
});

export const insertRiskLevelEditSchema = createInsertSchema(riskLevelEdits).omit({
  id: true,
  editedAt: true,
});

// Client data input schema for GDPR risk assessment
export const clientDataInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  income: z.number().min(0, "Income must be positive"),
  location: z.string().min(1, "Location is required"),
  financialBehavior: z.string().min(1, "Financial behavior is required"),
  usesAI: z.boolean(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertRiskAssessment = z.infer<typeof insertRiskAssessmentSchema>;
export type RiskAssessment = typeof riskAssessments.$inferSelect;
export type InsertModuleUsage = z.infer<typeof insertModuleUsageSchema>;
export type ModuleUsage = typeof moduleUsage.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;
export type InsertBiasChecklist = z.infer<typeof insertBiasChecklistSchema>;
export type BiasChecklist = typeof biasChecklists.$inferSelect;
export type InsertExplainabilityPlan = z.infer<typeof insertExplainabilityPlanSchema>;
export type ExplainabilityPlan = typeof explainabilityPlans.$inferSelect;
export type InsertComplianceRoadmap = z.infer<typeof insertComplianceRoadmapSchema>;
export type ComplianceRoadmap = typeof complianceRoadmaps.$inferSelect;
export type InsertTemplateDownload = z.infer<typeof insertTemplateDownloadSchema>;
export type TemplateDownload = typeof templateDownloads.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertClickHeatmap = z.infer<typeof insertClickHeatmapSchema>;
export type ClickHeatmap = typeof clickHeatmap.$inferSelect;
export type InsertResourceAccess = z.infer<typeof insertResourceAccessSchema>;
export type ResourceAccess = typeof resourceAccess.$inferSelect;
export type InsertAiModelClassification = z.infer<typeof insertAiModelClassificationSchema>;
export type AiModelClassification = typeof aiModelClassifications.$inferSelect;
export type InsertDocumentAnalysis = z.infer<typeof insertDocumentAnalysisSchema>;
export type DocumentAnalysis = typeof documentAnalyses.$inferSelect;
export type InsertRiskLevelEdit = z.infer<typeof insertRiskLevelEditSchema>;
export type RiskLevelEdit = typeof riskLevelEdits.$inferSelect;
export type ClientDataInput = z.infer<typeof clientDataInputSchema>;
