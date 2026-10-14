import { randomBytes } from "crypto";
import { 
  users, 
  riskAssessments,
  moduleUsage,
  feedback,
  biasChecklists,
  explainabilityPlans,
  complianceRoadmaps,
  governanceReports,
  type GovernanceReport,
  trainingCompletions,
  type TrainingCompletion,
  templateDownloads,
  aiModelClassifications,
  documentAnalyses,
  riskLevelEdits,
  type User, 
  type InsertUser,
  type InsertRiskAssessment,
  type RiskAssessment,
  type InsertModuleUsage,
  type ModuleUsage,
  type InsertFeedback,
  type Feedback,
  type InsertBiasChecklist,
  type BiasChecklist,
  type InsertExplainabilityPlan,
  type ExplainabilityPlan,
  type InsertComplianceRoadmap,
  type ComplianceRoadmap,
  type InsertTemplateDownload,
  type TemplateDownload,
  type InsertAiModelClassification,
  type AiModelClassification,
  type DocumentAnalysis,
  type InsertDocumentAnalysis,
  type InsertRiskLevelEdit,
  type RiskLevelEdit,
  userSessions,
  clickHeatmap,
  resourceAccess,
  type UserSession,
  type InsertUserSession,
  type ClickHeatmap,
  type InsertClickHeatmap,
  type ResourceAccess,
  type InsertResourceAccess,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, sql, and } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Risk assessments
  createRiskAssessment(assessment: InsertRiskAssessment): Promise<RiskAssessment>;
  getRiskAssessmentsByUserId(userId: number): Promise<RiskAssessment[]>;
  
  // Module usage
  createModuleUsage(usage: InsertModuleUsage): Promise<ModuleUsage>;
  getModuleUsageByUserId(userId: number): Promise<ModuleUsage[]>;
  
  // Feedback
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getFeedbackByUserId(userId: number): Promise<Feedback[]>;
  
  // Bias checklists
  upsertBiasChecklist(checklist: InsertBiasChecklist): Promise<BiasChecklist>;
  getBiasChecklistByUserId(userId: number): Promise<BiasChecklist | undefined>;
  
  // Explainability plans
  upsertExplainabilityPlan(plan: InsertExplainabilityPlan): Promise<ExplainabilityPlan>;
  getExplainabilityPlanByUserId(userId: number): Promise<ExplainabilityPlan | undefined>;
  
  // Compliance roadmaps
  upsertComplianceRoadmap(roadmap: InsertComplianceRoadmap): Promise<ComplianceRoadmap>;
  getComplianceRoadmapByUserId(userId: number): Promise<ComplianceRoadmap | undefined>;
  getGovernanceReport(userId: number): Promise<GovernanceReport | undefined>;
  saveGovernanceReport(userId: number, data: { company: unknown; controls: unknown; systems: unknown }): Promise<GovernanceReport>;
  ensureTrainingCode(userId: number): Promise<string>;
  getReportByTrainingCode(code: string): Promise<GovernanceReport | undefined>;
  addTrainingCompletion(data: { ownerUserId: number; name: string; role: string; score: number; total: number; version: string }): Promise<TrainingCompletion>;
  getTrainingCompletions(ownerUserId: number): Promise<TrainingCompletion[]>;
  
  // Template downloads
  createTemplateDownload(download: InsertTemplateDownload): Promise<TemplateDownload>;
  getTemplateDownloadsByUserId(userId: number): Promise<TemplateDownload[]>;
  
  // AI Model Classifications
  createAiModelClassification(classification: InsertAiModelClassification): Promise<AiModelClassification>;
  getAiModelClassificationsByUserId(userId: number): Promise<AiModelClassification[]>;
  getAiModelClassificationsByDepartment(userId: number): Promise<{ department: string; classifications: AiModelClassification[] }[]>;
  getAiModelClassificationStats(userId: number): Promise<{ aiActStatus: string; count: number }[]>;
  getAiModelClassificationById(id: number): Promise<AiModelClassification | undefined>;
  updateAiModelClassification(id: number, updates: Partial<AiModelClassification>): Promise<AiModelClassification>;
  
  // Risk Level Edits
  createRiskLevelEdit(edit: InsertRiskLevelEdit): Promise<RiskLevelEdit>;
  getRiskLevelEditsByModelId(modelId: number): Promise<RiskLevelEdit[]>;
  
  // Dashboard metrics
  getUserDashboardMetrics(userId: number): Promise<{
    modulesCompleted: number;
    riskAssessments: number;
    templatesDownloaded: number;
    complianceScore: number;
    totalSessionTime: number;
  }>;
  
  // Session tracking
  startUserSession(userId: number): Promise<UserSession>;
  endUserSession(sessionId: number): Promise<UserSession>;
  getUserSessions(userId: number): Promise<UserSession[]>;
  
  // Click heatmap
  recordClick(userId: number, page: string, elementId?: string, elementType?: string): Promise<void>;
  getClickHeatmap(userId: number): Promise<ClickHeatmap[]>;
  getAllClickHeatmap(): Promise<ClickHeatmap[]>;
  
  // Resource access
  recordResourceAccess(userId: number, resourceType: string, resourceName: string): Promise<void>;
  getMostAccessedResources(): Promise<{ resourceName: string; accessCount: number; resourceType: string }[]>;
  getUserResourceAccess(userId: number): Promise<ResourceAccess[]>;
  
  // Document Analyses
  getDocumentAnalysesByUserId(userId: number): Promise<DocumentAnalysis[]>;
  getDocumentAnalysisStats(userId: number): Promise<any>;

  // Visitor analytics
  getVisitorStats(days?: number | null): Promise<{
    totalUsers: number;
    totalSessions: number;
    activeUsersLast7Days: number;
    activeUsersLast30Days: number;
    chartData: { label: string; sessions: number }[];
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createRiskAssessment(assessment: InsertRiskAssessment): Promise<RiskAssessment> {
    const [result] = await db
      .insert(riskAssessments)
      .values(assessment)
      .returning();
    return result;
  }

  async getRiskAssessmentsByUserId(userId: number): Promise<RiskAssessment[]> {
    return await db
      .select()
      .from(riskAssessments)
      .where(eq(riskAssessments.userId, userId))
      .orderBy(desc(riskAssessments.createdAt));
  }

  async createModuleUsage(usage: InsertModuleUsage): Promise<ModuleUsage> {
    const [result] = await db
      .insert(moduleUsage)
      .values(usage)
      .returning();
    return result;
  }

  async getModuleUsageByUserId(userId: number): Promise<ModuleUsage[]> {
    return await db
      .select()
      .from(moduleUsage)
      .where(eq(moduleUsage.userId, userId))
      .orderBy(desc(moduleUsage.completedAt));
  }

  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const [result] = await db
      .insert(feedback)
      .values(feedbackData)
      .returning();
    return result;
  }

  async getFeedbackByUserId(userId: number): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .where(eq(feedback.userId, userId))
      .orderBy(desc(feedback.createdAt));
  }

  async upsertBiasChecklist(checklist: InsertBiasChecklist): Promise<BiasChecklist> {
    const existing = await db
      .select()
      .from(biasChecklists)
      .where(eq(biasChecklists.userId, checklist.userId));

    if (existing.length > 0) {
      const [result] = await db
        .update(biasChecklists)
        .set({ ...checklist, updatedAt: new Date() })
        .where(eq(biasChecklists.userId, checklist.userId))
        .returning();
      return result;
    } else {
      const [result] = await db
        .insert(biasChecklists)
        .values(checklist)
        .returning();
      return result;
    }
  }

  async getBiasChecklistByUserId(userId: number): Promise<BiasChecklist | undefined> {
    const [result] = await db
      .select()
      .from(biasChecklists)
      .where(eq(biasChecklists.userId, userId));
    return result || undefined;
  }

  async upsertExplainabilityPlan(plan: InsertExplainabilityPlan): Promise<ExplainabilityPlan> {
    const existing = await db
      .select()
      .from(explainabilityPlans)
      .where(eq(explainabilityPlans.userId, plan.userId));

    if (existing.length > 0) {
      const [result] = await db
        .update(explainabilityPlans)
        .set({ ...plan, updatedAt: new Date() })
        .where(eq(explainabilityPlans.userId, plan.userId))
        .returning();
      return result;
    } else {
      const [result] = await db
        .insert(explainabilityPlans)
        .values(plan)
        .returning();
      return result;
    }
  }

  async getExplainabilityPlanByUserId(userId: number): Promise<ExplainabilityPlan | undefined> {
    const [result] = await db
      .select()
      .from(explainabilityPlans)
      .where(eq(explainabilityPlans.userId, userId));
    return result || undefined;
  }

  async upsertComplianceRoadmap(roadmap: InsertComplianceRoadmap): Promise<ComplianceRoadmap> {
    const existing = await db
      .select()
      .from(complianceRoadmaps)
      .where(eq(complianceRoadmaps.userId, roadmap.userId));

    if (existing.length > 0) {
      const [result] = await db
        .update(complianceRoadmaps)
        .set({ ...roadmap, updatedAt: new Date() })
        .where(eq(complianceRoadmaps.userId, roadmap.userId))
        .returning();
      return result;
    } else {
      const [result] = await db
        .insert(complianceRoadmaps)
        .values(roadmap)
        .returning();
      return result;
    }
  }

  async getComplianceRoadmapByUserId(userId: number): Promise<ComplianceRoadmap | undefined> {
    const [result] = await db
      .select()
      .from(complianceRoadmaps)
      .where(eq(complianceRoadmaps.userId, userId));
    return result || undefined;
  }

  async getGovernanceReport(userId: number): Promise<GovernanceReport | undefined> {
    const [result] = await db
      .select()
      .from(governanceReports)
      .where(eq(governanceReports.userId, userId));
    return result || undefined;
  }

  async saveGovernanceReport(
    userId: number,
    data: { company: unknown; controls: unknown; systems: unknown },
  ): Promise<GovernanceReport> {
    const [result] = await db
      .insert(governanceReports)
      .values({ userId, ...data })
      .onConflictDoUpdate({
        target: governanceReports.userId,
        set: { ...data, updatedAt: new Date() },
      })
      .returning();
    return result;
  }

  async ensureTrainingCode(userId: number): Promise<string> {
    const existing = await this.getGovernanceReport(userId);
    if (existing?.trainingCode) return existing.trainingCode;
    const code = randomBytes(9).toString("base64url");
    if (existing) {
      await db.update(governanceReports).set({ trainingCode: code }).where(eq(governanceReports.userId, userId));
    } else {
      await db.insert(governanceReports).values({ userId, company: {}, controls: {}, systems: [], trainingCode: code });
    }
    return code;
  }

  async getReportByTrainingCode(code: string): Promise<GovernanceReport | undefined> {
    const [result] = await db.select().from(governanceReports).where(eq(governanceReports.trainingCode, code));
    return result || undefined;
  }

  async addTrainingCompletion(data: { ownerUserId: number; name: string; role: string; score: number; total: number; version: string }): Promise<TrainingCompletion> {
    const [result] = await db.insert(trainingCompletions).values(data).returning();
    return result;
  }

  async getTrainingCompletions(ownerUserId: number): Promise<TrainingCompletion[]> {
    return db.select().from(trainingCompletions).where(eq(trainingCompletions.ownerUserId, ownerUserId)).orderBy(desc(trainingCompletions.completedAt));
  }

  async createTemplateDownload(download: InsertTemplateDownload): Promise<TemplateDownload> {
    const [result] = await db
      .insert(templateDownloads)
      .values(download)
      .returning();
    return result;
  }

  async getTemplateDownloadsByUserId(userId: number): Promise<TemplateDownload[]> {
    return await db
      .select()
      .from(templateDownloads)
      .where(eq(templateDownloads.userId, userId))
      .orderBy(desc(templateDownloads.downloadedAt));
  }

  async createAiModelClassification(classification: InsertAiModelClassification): Promise<AiModelClassification> {
    const [result] = await db
      .insert(aiModelClassifications)
      .values(classification)
      .returning();
    return result;
  }

  async getAiModelClassificationsByUserId(userId: number): Promise<AiModelClassification[]> {
    return await db
      .select()
      .from(aiModelClassifications)
      .where(eq(aiModelClassifications.userId, userId))
      .orderBy(desc(aiModelClassifications.createdAt));
  }

  async getAiModelClassificationsByDepartment(userId: number): Promise<{ department: string; classifications: AiModelClassification[] }[]> {
    const classifications = await db
      .select()
      .from(aiModelClassifications)
      .where(eq(aiModelClassifications.userId, userId))
      .orderBy(desc(aiModelClassifications.createdAt));

    const departmentMap = new Map<string, AiModelClassification[]>();
    classifications.forEach(classification => {
      const dept = classification.department || 'Unknown';
      if (!departmentMap.has(dept)) {
        departmentMap.set(dept, []);
      }
      departmentMap.get(dept)!.push(classification);
    });

    return Array.from(departmentMap.entries()).map(([department, classifications]) => ({
      department,
      classifications
    }));
  }

  async getAiModelClassificationStats(userId: number): Promise<{ aiActStatus: string; count: number }[]> {
    const stats = await db
      .select({
        aiActStatus: aiModelClassifications.aiActStatus,
        count: count()
      })
      .from(aiModelClassifications)
      .where(eq(aiModelClassifications.userId, userId))
      .groupBy(aiModelClassifications.aiActStatus);

    return stats.map(stat => ({
      aiActStatus: stat.aiActStatus,
      count: stat.count
    }));
  }

  async getUserDashboardMetrics(userId: number): Promise<{
    modulesCompleted: number;
    riskAssessments: number;
    templatesDownloaded: number;
    complianceScore: number;
    totalSessionTime: number;
  }> {
    const [moduleCount] = await db
      .select({ count: count() })
      .from(moduleUsage)
      .where(eq(moduleUsage.userId, userId));

    const [riskCount] = await db
      .select({ count: count() })
      .from(riskAssessments)
      .where(eq(riskAssessments.userId, userId));

    const [templateCount] = await db
      .select({ count: count() })
      .from(templateDownloads)
      .where(eq(templateDownloads.userId, userId));

    // Calculate compliance score based on completed modules and assessments
    const totalModules = 5; // Total available modules
    const completedModules = moduleCount.count;
    const hasRiskAssessment = riskCount.count > 0 ? 1 : 0;
    const complianceScore = Math.round(((completedModules + hasRiskAssessment) / (totalModules + 1)) * 100);

    // Calculate total session time
    const sessionTime = await db
      .select({ 
        totalTime: sql<number>`COALESCE(SUM(CASE WHEN ${userSessions.duration} IS NOT NULL THEN ${userSessions.duration} ELSE 0 END), 0)`.as('totalTime')
      })
      .from(userSessions)
      .where(eq(userSessions.userId, userId));

    return {
      modulesCompleted: completedModules,
      riskAssessments: riskCount.count,
      templatesDownloaded: templateCount.count,
      complianceScore,
      totalSessionTime: sessionTime[0]?.totalTime || 0
    };
  }

  // Session tracking methods
  async startUserSession(userId: number): Promise<UserSession> {
    const [result] = await db
      .insert(userSessions)
      .values({ userId })
      .returning();
    return result;
  }

  async endUserSession(sessionId: number): Promise<UserSession> {
    const session = await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.id, sessionId))
      .limit(1);
    
    if (session.length === 0) {
      throw new Error('Session not found');
    }

    const endTime = new Date();
    const startTime = session[0].startTime;
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    const [result] = await db
      .update(userSessions)
      .set({ endTime, duration })
      .where(eq(userSessions.id, sessionId))
      .returning();
    
    return result;
  }

  async getUserSessions(userId: number): Promise<UserSession[]> {
    return await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.userId, userId))
      .orderBy(desc(userSessions.startTime));
  }

  // Click heatmap methods
  async recordClick(userId: number, page: string, elementId?: string, elementType?: string): Promise<void> {
    const existing = await db
      .select()
      .from(clickHeatmap)
      .where(
        and(
          eq(clickHeatmap.userId, userId),
          eq(clickHeatmap.page, page),
          elementId ? eq(clickHeatmap.elementId, elementId) : sql`${clickHeatmap.elementId} IS NULL`
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(clickHeatmap)
        .set({ 
          clickCount: sql`${clickHeatmap.clickCount} + 1`,
          lastClickedAt: new Date()
        })
        .where(eq(clickHeatmap.id, existing[0].id));
    } else {
      await db
        .insert(clickHeatmap)
        .values({
          userId,
          page,
          elementId: elementId || null,
          elementType: elementType || null,
          clickCount: 1
        });
    }
  }

  async getClickHeatmap(userId: number): Promise<ClickHeatmap[]> {
    return await db
      .select()
      .from(clickHeatmap)
      .where(eq(clickHeatmap.userId, userId))
      .orderBy(desc(clickHeatmap.clickCount));
  }

  async getAllClickHeatmap(): Promise<ClickHeatmap[]> {
    return await db
      .select({
        id: clickHeatmap.id,
        userId: clickHeatmap.userId,
        page: clickHeatmap.page,
        elementId: clickHeatmap.elementId,
        elementType: clickHeatmap.elementType,
        clickCount: clickHeatmap.clickCount,
        lastClickedAt: clickHeatmap.lastClickedAt
      })
      .from(clickHeatmap)
      .orderBy(desc(clickHeatmap.clickCount));
  }

  // Resource access methods
  async recordResourceAccess(userId: number, resourceType: string, resourceName: string): Promise<void> {
    const existing = await db
      .select()
      .from(resourceAccess)
      .where(
        and(
          eq(resourceAccess.userId, userId),
          eq(resourceAccess.resourceType, resourceType),
          eq(resourceAccess.resourceName, resourceName)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(resourceAccess)
        .set({ 
          accessCount: sql`${resourceAccess.accessCount} + 1`,
          lastAccessedAt: new Date()
        })
        .where(eq(resourceAccess.id, existing[0].id));
    } else {
      await db
        .insert(resourceAccess)
        .values({
          userId,
          resourceType,
          resourceName,
          accessCount: 1
        });
    }
  }

  async getMostAccessedResources(): Promise<{ resourceName: string; accessCount: number; resourceType: string }[]> {
    return await db
      .select({
        resourceName: resourceAccess.resourceName,
        resourceType: resourceAccess.resourceType,
        accessCount: sql<number>`SUM(${resourceAccess.accessCount})`.as('accessCount')
      })
      .from(resourceAccess)
      .groupBy(resourceAccess.resourceName, resourceAccess.resourceType)
      .orderBy(desc(sql`SUM(${resourceAccess.accessCount})`))
      .limit(10);
  }

  async getUserResourceAccess(userId: number): Promise<ResourceAccess[]> {
    return await db
      .select()
      .from(resourceAccess)
      .where(eq(resourceAccess.userId, userId))
      .orderBy(desc(resourceAccess.accessCount));
  }

  async getAiModelClassificationById(id: number): Promise<AiModelClassification | undefined> {
    const [result] = await db
      .select()
      .from(aiModelClassifications)
      .where(eq(aiModelClassifications.id, id))
      .limit(1);
    return result || undefined;
  }

  async updateAiModelClassification(id: number, updates: Partial<AiModelClassification>): Promise<AiModelClassification> {
    const [result] = await db
      .update(aiModelClassifications)
      .set(updates)
      .where(eq(aiModelClassifications.id, id))
      .returning();
    return result;
  }

  // Risk level edit methods
  async createRiskLevelEdit(edit: InsertRiskLevelEdit): Promise<RiskLevelEdit> {
    const [result] = await db
      .insert(riskLevelEdits)
      .values(edit)
      .returning();
    return result;
  }

  async getRiskLevelEditsByModelId(modelId: number): Promise<RiskLevelEdit[]> {
    return await db
      .select()
      .from(riskLevelEdits)
      .where(eq(riskLevelEdits.modelId, modelId))
      .orderBy(desc(riskLevelEdits.editedAt));
  }

  // Document analysis methods
  async getDocumentAnalysesByUserId(userId: number): Promise<DocumentAnalysis[]> {
    return await db
      .select()
      .from(documentAnalyses)
      .where(eq(documentAnalyses.userId, userId))
      .orderBy(desc(documentAnalyses.createdAt));
  }

  async getDocumentAnalysisStats(userId: number): Promise<any> {
    const stats = await db
      .select({
        overallRisk: documentAnalyses.overallRisk,
        count: count(documentAnalyses.id)
      })
      .from(documentAnalyses)
      .where(eq(documentAnalyses.userId, userId))
      .groupBy(documentAnalyses.overallRisk);

    return stats.map(stat => ({
      overallRisk: stat.overallRisk,
      count: stat.count
    }));
  }

  async getVisitorStats(days?: number | null): Promise<{
    totalUsers: number;
    totalSessions: number;
    activeUsersLast7Days: number;
    activeUsersLast30Days: number;
    chartData: { label: string; sessions: number }[];
  }> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalUsersResult] = await db
      .select({ count: count(users.id) })
      .from(users);

    const [totalSessionsResult] = await db
      .select({ count: count(userSessions.id) })
      .from(userSessions);

    const activeUsers7 = await db
      .selectDistinct({ userId: userSessions.userId })
      .from(userSessions)
      .where(sql`${userSessions.startTime} >= ${sevenDaysAgo}`);

    const activeUsers30 = await db
      .selectDistinct({ userId: userSessions.userId })
      .from(userSessions)
      .where(sql`${userSessions.startTime} >= ${thirtyDaysAgo}`);

    // All-time: group by month. Otherwise: group by day with date filter.
    let chartData: { label: string; sessions: number }[];
    if (days == null) {
      const rows = await db
        .select({
          label: sql<string>`TO_CHAR(${userSessions.startTime}, 'Mon YYYY')`.as('label'),
          sort_key: sql<string>`TO_CHAR(${userSessions.startTime}, 'YYYY-MM')`.as('sort_key'),
          sessions: count(userSessions.id)
        })
        .from(userSessions)
        .groupBy(
          sql`TO_CHAR(${userSessions.startTime}, 'Mon YYYY')`,
          sql`TO_CHAR(${userSessions.startTime}, 'YYYY-MM')`
        )
        .orderBy(sql`TO_CHAR(${userSessions.startTime}, 'YYYY-MM')`);
      chartData = rows.map(r => ({ label: r.label, sessions: Number(r.sessions) }));
    } else {
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      const rows = await db
        .select({
          label: sql<string>`TO_CHAR(${userSessions.startTime}, 'YYYY-MM-DD')`.as('label'),
          sessions: count(userSessions.id)
        })
        .from(userSessions)
        .where(sql`${userSessions.startTime} >= ${cutoff}`)
        .groupBy(sql`TO_CHAR(${userSessions.startTime}, 'YYYY-MM-DD')`)
        .orderBy(sql`TO_CHAR(${userSessions.startTime}, 'YYYY-MM-DD')`);
      chartData = rows.map(r => ({
        label: new Date(r.label + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        sessions: Number(r.sessions)
      }));
    }

    return {
      totalUsers: totalUsersResult?.count ?? 0,
      totalSessions: totalSessionsResult?.count ?? 0,
      activeUsersLast7Days: activeUsers7.length,
      activeUsersLast30Days: activeUsers30.length,
      chartData,
    };
  }
}

export const storage = new DatabaseStorage();
