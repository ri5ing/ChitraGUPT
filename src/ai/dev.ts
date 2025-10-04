'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-detailed-report.ts';
import '@/ai/flows/contract-summary-and-risk-assessment.ts';
import '@/ai/flows/draft-missing-clauses.ts';
import '@/ai/flows/aadhar-kyc-flow.ts';
