import { User, Contract } from '@/types';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    avatarUrl: 'https://picsum.photos/seed/avatar1/100/100',
    role: 'client',
    credits: 15,
    subscription: 'Pro',
  },
  {
    id: 'user-2',
    name: 'Bob Williams',
    email: 'bob@example.com',
    avatarUrl: 'https://picsum.photos/seed/avatar2/100/100',
    role: 'auditor',
    credits: 0,
    subscription: 'Free',
  },
  {
    id: 'user-3',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    avatarUrl: 'https://picsum.photos/seed/avatar3/100/100',
    role: 'admin',
    credits: 999,
    subscription: 'Enterprise',
  },
  {
    id: 'user-4',
    name: 'Diana Prince',
    email: 'diana@example.com',
    avatarUrl: 'https://picsum.photos/seed/avatar4/100/100',
    role: 'client',
    credits: 0,
    subscription: 'Free',
  },
];

export const mockContracts: Contract[] = [
  {
    id: 'contract-001',
    title: 'MSA for Tech Services',
    clientName: 'Innovate Corp',
    status: 'Completed',
    uploadDate: '2023-10-26',
    riskScore: 25,
    aiAnalysis: {
      summary: 'This Master Services Agreement outlines the terms for providing ongoing software development and support. Key sections include service levels, payment terms, and intellectual property rights. The agreement has a term of two years, with an option for renewal.',
      riskAssessment: 'Low Risk. The contract contains standard liability clauses and clear termination conditions. The intellectual property rights are well-defined, favoring our client. One area for review is the data privacy clause, which could be more specific regarding GDPR compliance.',
      missingClauses: ['Data Processing Agreement (DPA)', 'Disaster Recovery Plan'],
      recommendations: 'Recommend adding a specific Data Processing Agreement (DPA) as an addendum to ensure full GDPR compliance. Also, suggest clarifying the process for service level credit claims.',
    },
    auditorFeedback: [
        {
            id: 'fb-001',
            contractId: 'contract-001',
            auditorName: 'Bob Williams',
            auditorAvatarUrl: 'https://picsum.photos/seed/avatar2/100/100',
            feedback: 'The AI analysis is accurate. I have drafted the DPA as recommended. Please review and sign. The rest of the contract looks solid.',
            timestamp: '2023-10-28T10:00:00Z',
        }
    ]
  },
  {
    id: 'contract-002',
    title: 'NDA with Beta Testers',
    clientName: 'Stealth Startup',
    status: 'In Review',
    uploadDate: '2023-11-15',
    riskScore: 55,
    aiAnalysis: {
        summary: 'A Non-Disclosure Agreement for beta testers of a new mobile application. It covers confidential information, tester obligations, and the duration of the confidentiality.',
        riskAssessment: 'Medium Risk. The definition of "Confidential Information" is overly broad and could be challenged. The remedies for breach are not clearly specified, which might make enforcement difficult.',
        missingClauses: ['Residuals Clause', 'Feedback and Intellectual Property'],
        recommendations: 'Narrow the definition of "Confidential Information" to be more specific. Explicitly state the remedies for a breach of contract. Add a clause to clarify ownership of any feedback provided by testers.',
    },
    auditorFeedback: []
  },
  {
    id: 'contract-003',
    title: 'Commercial Lease Agreement',
    clientName: 'Main Street Bakery',
    status: 'Action Required',
    uploadDate: '2023-12-01',
    riskScore: 85,
    aiAnalysis: {
        summary: 'This is a 5-year commercial lease agreement for a retail space. It details rent, maintenance responsibilities, and use of premises.',
        riskAssessment: 'High Risk. The indemnity clause places excessive liability on the tenant. There is no clause for early termination, and the landlord has the unilateral right to change building rules. The rent escalation clause is above market rate.',
        missingClauses: ['Subletting Clause', 'Early Termination Clause', 'Force Majeure'],
        recommendations: 'Immediate renegotiation is required. Focus on revising the indemnity clause, adding an early termination option, and capping the annual rent increase. A force majeure clause is essential.',
    },
    auditorFeedback: []
  },
  {
    id: 'contract-004',
    title: 'Freelance Graphic Design Contract',
    clientName: 'Creative Co.',
    status: 'Pending',
    uploadDate: '2024-01-05',
    riskScore: 10,
    aiAnalysis: undefined,
    auditorFeedback: []
  },
];
