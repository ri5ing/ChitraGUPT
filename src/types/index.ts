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
  // Auditor-specific fields
  specialization?: string[];
  experience?: number;
  certifications?: string;
  firm?: string;
  maxActiveContracts?: number;
  currentActiveContracts?: number;
};

export type AuditorProfile = {
    id: string;
    displayName: string;
    avatarUrl: string;
    firm?: string;
    specialization?: string[];
    experience?: number;
    maxActiveContracts?: number;
    currentActiveContracts?: number;
}

export type Contract = {
  id: string;
  title: string;
  userId: string;
  status: 'Pending' | 'In Review' | 'Completed' | 'Action Required' | 'Pending Approval';
  uploadDate: Timestamp;
  fileName: string;
  description?: string;
  aiAnalysis?: AIAnalysisReport;
  auditorFeedback?: AuditorFeedback[];
  finalFeedback?: AuditorFeedback;
  auditorId?: string;
  publicReportId?: string;
  reviewRequestId?: string;
};

export type PublicContractReport = {
  id: string;
  contractTitle: string;
  uploadDate: Timestamp;
  analysis: AIAnalysisReport;
}

export type AIAnalysisReport = {
  id: string;
  summary: string[];
  sanitizedSummary: string[];
  riskAssessment: string[];
  missingClauses: string[];
  recommendations: string[];
  riskScore: number;
  aiConfidenceScore: number;
  documentSeverity: 'Low' | 'Medium' | 'High' | 'Critical';
  contractType: string;
};

export type AuditorFeedback = {
  id: string;
  contractId: string;
  auditorId: string;
  auditorName: string;
  auditorAvatarUrl: string;
  feedback: string;
  timestamp: Timestamp;
  verdict: 'Approved' | 'Approved with Revisions' | 'Action Required';
};

export type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  timestamp: Timestamp;
};

export type ReviewRequest = {
  id: string;
  contractId: string;
  contractTitle: string;
  contractUserId: string; // The user ID of the contract owner
  clientId: string;
  clientName: string;
  auditorId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'pending_approval';
  requestDate: Timestamp;
  // New fields for the secure connection workflow
  budget?: number;
  clientConcerns?: string;
  shareAiSummary: boolean;
  aiSummary?: string[];
  riskScore?: number;
  documentSeverity?: AIAnalysisReport['documentSeverity'];
};
    
