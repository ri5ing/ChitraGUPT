import { Timestamp } from "firebase/firestore";

export type UserProfile = {
  id: string;
  displayName?: string;
  email: string;
  avatarUrl: string;
  role: 'client' | 'auditor' | 'admin';
  creditBalance: number;
  subscriptionPlan: 'Free' | 'Pro' | 'Enterprise';
  mobile?: string;
  organization?: string;
  motive?: string;
  kyc?: {
    aadharName?: string;
    aadharNumber?: string;
  };
  specialization?: string[];
  experience?: number;
  certifications?: string;
  firm?: string;
};

export type AuditorProfile = {
    id: string;
    displayName: string;
    avatarUrl: string;
    firm?: string;
    specialization?: string[];
    experience?: number;
}

export type Contract = {
  id: string;
  title: string;
  userId: string;
  status: 'Pending' | 'In Review' | 'Completed' | 'Action Required';
  uploadDate: Timestamp;
  fileName: string;
  description?: string;
  aiAnalysis?: AIAnalysisReport;
  auditorFeedback?: AuditorFeedback[];
  auditorId?: string;
};

export type AIAnalysisReport = {
  id: string;
  summary: string[];
  riskAssessment: string[];
  missingClauses: string[];
  recommendations: string[];
  riskScore: number;
  aiConfidenceScore: number;
  documentSeverity: 'Low' | 'Medium' | 'High' | 'Critical';
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

export type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  timestamp: Timestamp;
};
    
