'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting missing clauses in a contract.
 *
 * The flow takes contract text as input and returns a list of suggested missing clauses based on industry standards and best practices.
 *
 * @remarks
 * - draftMissingClauses - A function that takes contract text as input and returns suggested missing clauses.
 * - DraftMissingClausesInput - The input type for the draftMissingClauses function.
 * - DraftMissingClausesOutput - The output type for the draftMissingClauses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DraftMissingClausesInputSchema = z.object({
  contractText: z
    .string()
    .describe('The text of the contract to analyze for missing clauses.'),
});

export type DraftMissingClausesInput = z.infer<typeof DraftMissingClausesInputSchema>;

const DraftMissingClausesOutputSchema = z.object({
  suggestedClauses: z
    .array(z.string())
    .describe('A list of clauses suggested to be added to the contract.'),
});

export type DraftMissingClausesOutput = z.infer<typeof DraftMissingClausesOutputSchema>;

export async function draftMissingClauses(input: DraftMissingClausesInput): Promise<DraftMissingClausesOutput> {
  return draftMissingClausesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'draftMissingClausesPrompt',
  input: {schema: DraftMissingClausesInputSchema},
  output: {schema: DraftMissingClausesOutputSchema},
  prompt: `You are an expert legal contract analyst.

  Based on industry standards and best practices, review the following contract text and suggest any missing clauses that would be relevant or improve the contract for the client.

  Contract Text: {{{contractText}}}

  Present the suggested clauses as a list of strings.
  `,
});

const draftMissingClausesFlow = ai.defineFlow(
  {
    name: 'draftMissingClausesFlow',
    inputSchema: DraftMissingClausesInputSchema,
    outputSchema: DraftMissingClausesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
