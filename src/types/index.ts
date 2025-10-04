export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'client' | 'auditor' | 'admin';
  credits: number;
  subscription: 'Free' | 'Pro' | 'Enterprise';
};

export type Contract = {
  id: string;
  title: string;
  clientName: string;
  status: 'Pending' | 'In Review' | 'Completed' | 'Action Required';
  uploadDate: string;
  riskScore: number;
  aiAnalysis?: {
    summary: string;
    riskAssessment: string;
    missingClauses: string[];
    recommendations: string;
  };
  auditorFeedback?: AuditorFeedback[];
};

export type AuditorFeedback = {
  id: string;
  contractId: string;
  auditorName: string;
  auditorAvatarUrl: string;
  feedback: string;
  timestamp: string;
};
