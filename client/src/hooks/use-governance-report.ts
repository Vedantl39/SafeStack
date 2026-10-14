import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/auth";
import {
  DEFAULT_COMPANY,
  DEFAULT_CONTROLS,
  DEFAULT_ANSWERS,
  type CompanyProfile,
  type CompanyControls,
  type ReportSystem,
} from "@shared/ai-act-rules";

export interface ReportData {
  company: CompanyProfile;
  controls: CompanyControls;
  systems: ReportSystem[];
  updatedAt?: string;
  trainingCode?: string;
  completions: TrainingCompletion[];
}

export interface TrainingCompletion {
  id: number;
  name: string;
  role: string;
  score: number;
  total: number;
  version: string;
  completedAt: string;
}

export function normaliseReport(raw: any): ReportData {
  return {
    company: { ...DEFAULT_COMPANY, ...(raw?.company ?? {}) },
    controls: { ...DEFAULT_CONTROLS, ...(raw?.controls ?? {}) },
    systems: Array.isArray(raw?.systems)
      ? raw.systems.map((s: any) => ({
          ...s,
          answers: { ...DEFAULT_ANSWERS, ...(s.answers ?? {}), prohibited: s.answers?.prohibited ?? [] },
          done: s.done ?? {},
        }))
      : [],
    updatedAt: raw?.updatedAt,
    trainingCode: raw?.trainingCode,
    completions: Array.isArray(raw?.completions) ? raw.completions : [],
  };
}

export function useGovernanceReport(enabled: boolean) {
  return useQuery({
    queryKey: ["/api/governance-report"],
    enabled,
    queryFn: async () => {
      const token = authApi.getToken();
      const res = await fetch("/api/governance-report", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to load report");
      return normaliseReport(await res.json());
    },
  });
}
