'use server';

/**
 * @fileOverview A flow for generating a detailed report based on contract analysis.
 *
 * - generateDetailedReport - A function to generate a detailed report.
 * - GenerateDetailedReportInput - The input type for the generateDetailedReport function.
 * - GenerateDetailedReportOutput - The return type for the generateDetailedReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDetailedReportInputSchema = z.object({
  contractSummary: z.string().describe('A summary of the contract.'),
  riskAreas: z.string().describe('Key risk areas identified in the contract.'),
  recommendations: z.string().describe('Recommendations for addressing the identified risk areas.'),
});
export type GenerateDetailedReportInput = z.infer<typeof GenerateDetailedReportInputSchema>;

const GenerateDetailedReportOutputSchema = z.object({
  report: z.string().describe('A detailed report summarizing the contract analysis, risk areas, and recommendations.'),
});
export type GenerateDetailedReportOutput = z.infer<typeof GenerateDetailedReportOutputSchema>;

export async function generateDetailedReport(input: GenerateDetailedReportInput): Promise<GenerateDetailedReportOutput> {
  return generateDetailedReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDetailedReportPrompt',
  input: {schema: GenerateDetailedReportInputSchema},
  output: {schema: GenerateDetailedReportOutputSchema},
  prompt: `You are an AI assistant that generates detailed reports based on contract analysis.

  Based on the following contract summary, risk areas, and recommendations, generate a comprehensive report.

  Contract Summary: {{{contractSummary}}}
  Risk Areas: {{{riskAreas}}}
  Recommendations: {{{recommendations}}}

  Report:`,
});

const generateDetailedReportFlow = ai.defineFlow(
  {
    name: 'generateDetailedReportFlow',
    inputSchema: GenerateDetailedReportInputSchema,
    outputSchema: GenerateDetailedReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
