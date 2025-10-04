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
  missingClauses: z.string().describe('List of potentially missing clauses in the contract.'),
  recommendations: z.string().describe('Recommendations for the client based on the contract analysis.'),
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

You will analyze the contract and provide a summary of the key terms, identify potential risks, suggest any missing clauses, and offer recommendations to the client.

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
