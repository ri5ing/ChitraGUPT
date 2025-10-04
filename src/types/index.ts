import { Timestamp } from "firebase/firestore";

export type UserProfile = {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  role: 'client' | 'auditor' | 'admin';
  creditBalance: number;
  subscriptionPlan: 'Free' | 'Pro' | 'Enterprise';
};

export type Contract = {
  id: string;
  title: string;
  userId: string;
  clientName: string;
  status: 'Pending' | 'In Review' | 'Completed' | 'Action Required';
  uploadDate: Timestamp;
  fileName: string;
  description?: string;
  riskScore?: number;
  analysisReportId?: string;
  aiAnalysis?: AIAnalysisReport;
  auditorFeedback?: AuditorFeedback[];
};

export type AIAnalysisReport = {
  id: string;
  summary: string;
  riskAssessment: string;
  missingClauses: string[];
  recommendations: string;
  riskScore: number;
};

export type AuditorFeedback = {
  id: string;
  contractId: string;
  auditorId: string;
  auditorName: string;
  auditorAvatarUrl: string;
  feedback: string;
  timestamp: Timestamp;
};
