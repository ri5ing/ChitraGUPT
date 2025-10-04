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
  summary: z.string().describe('A concise summary of the contract.'),
  riskAssessment: z.string().describe('An assessment of potential risks associated with the contract.'),
  missingClauses: z.array(z.string()).describe('List of potentially missing clauses in the contract.'),
  recommendations: z.string().describe('Recommendations for the client based on the contract analysis.'),
  riskScore: z.number().describe('A numerical risk score from 0 to 100, where 100 is the highest risk.'),
});
export type ContractSummaryAndRiskAssessmentOutput = z.infer<typeof ContractSummaryAndRiskAssessmentOutputSchema>;

export async function contractSummaryAndRiskAssessment(input: ContractSummaryAndRiskAssessmentInput): Promise<ContractSummaryAndRiskAssessmentOutput> {
  return contractSummaryAndRiskAssessmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contractSummaryAndRiskAssessmentPrompt',
  input: {schema: ContractSummaryAndRiskAssessmentInputSchema},
  output: {schema: ContractSummaryAndRiskAssessmentOutputSchema},
  prompt: `You are an expert legal analyst specializing in contract review.

You will analyze the contract and provide:
1. A summary of the key terms.
2. An assessment of potential risks.
3. A list of any important clauses that seem to be missing.
4. Recommendations for the client to improve their position.
5. A risk score between 0 and 100, where 0 is no risk and 100 is extremely high risk.

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
