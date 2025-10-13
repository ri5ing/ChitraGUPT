'use server';
/**
 * @fileOverview A contract summarization and risk assessment AI agent.
 *
 * - contractSummaryAndRiskAssessment - A function that handles the contract summarization and risk assessment process.
 * - ContractSummaryAndRiskAssessmentInput - The input type for the contractSummaryAndRiskAssessment function.
 * - ContractSummaryAndRiskAssessmentOutput - The return type for the contractSummaryAndRiskAssessment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContractSummaryAndRiskAssessmentInputSchema = z.object({
  contractDataUri: z
    .string()
    .describe(
      "A contract document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ContractSummaryAndRiskAssessmentInput = z.infer<typeof ContractSummaryAndRiskAssessmentInputSchema>;

const ContractSummaryAndRiskAssessmentOutputSchema = z.object({
  summary: z.array(z.string()).describe('A concise summary of the key terms of the contract, presented as a list of points.'),
  sanitizedSummary: z.array(z.string()).describe('A version of the summary that redacts all personally identifiable information (PII), names, addresses, and specific monetary values.'),
  riskAssessment: z.array(z.string()).describe('An assessment of potential risks associated with the contract, presented as a list of points.'),
  missingClauses: z.array(z.string()).describe('List of any important clauses that seem to be missing from the contract.'),
  recommendations: z.array(z.string()).describe('Recommendations for the client to improve their position, presented as a list of points.'),
  riskScore: z.number().describe('A numerical risk score from 0 to 100, where 100 is the highest risk.'),
  aiConfidenceScore: z.number().describe('A score from 0 to 100 indicating the AI\'s confidence in its analysis.'),
  documentSeverity: z.enum(['Low', 'Medium', 'High', 'Critical']).describe('The overall severity level of the document.'),
});
export type ContractSummaryAndRiskAssessmentOutput = z.infer<typeof ContractSummaryAndRiskAssessmentOutputSchema>;

export async function contractSummaryAndRiskAssessment(input: ContractSummaryAndRiskAssessmentInput): Promise<ContractSummaryAndRiskAssessmentOutput> {
  return contractSummaryAndRiskAssessmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contractSummaryAndRiskAssessmentPrompt',
  input: {schema: ContractSummaryAndRiskAssessmentInputSchema},
  output: {schema: ContractSummaryAndRiskAssessmentOutputSchema},
  prompt: `You are an expert legal analyst specializing in contract review. Your response must be in a formal, point-by-point format.

Analyze the contract provided and provide the following in a structured manner:
1.  **Summary**: A list of key points summarizing the contract's main terms.
2.  **Sanitized Summary**: A version of the summary that redacts all personally identifiable information (PII), names, addresses, and specific monetary values, suitable for sharing with third parties.
3.  **Risk Assessment**: A bulleted list detailing potential risks.
4.  **Missing Clauses**: A list of important clauses that appear to be missing.
5.  **Recommendations**: A list of actionable recommendations for the client.
6.  **Risk Score**: A numerical score from 0 to 100, where 100 is extremely high risk.
7.  **AI Confidence Score**: Your confidence in this analysis from 0-100.
8.  **Document Severity**: The overall severity of this contract, categorized as 'Low', 'Medium', 'High', or 'Critical'.

Analyze the following contract.

Contract: {{media url=contractDataUri}}`,
});

const contractSummaryAndRiskAssessmentFlow = ai.defineFlow(
  {
    name: 'contractSummaryAndRiskAssessmentFlow',
    inputSchema: ContractSummaryAndRiskAssessmentInputSchema,
    outputSchema: ContractSummaryAndRiskAssessmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
