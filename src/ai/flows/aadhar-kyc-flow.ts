'use server';
/**
 * @fileOverview A KYC (Know Your Customer) AI agent for Aadhar card verification.
 *
 * - aadharKycFlow - A function that handles the Aadhar card data extraction process.
 * - AadharKycInput - The input type for the aadharKycFlow function.
 * - AadharKycOutput - The return type for the aadharKycFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AadharKycInputSchema = z.object({
  aadharCardDataUri: z
    .string()
    .describe(
      "An image of an Aadhar card, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AadharKycInput = z.infer<typeof AadharKycInputSchema>;

const AadharKycOutputSchema = z.object({
  fullName: z.string().describe("The full name of the person as it appears on the Aadhar card."),
  aadharNumber: z.string().describe("The 12-digit Aadhar number, formatted as 'XXXX XXXX XXXX'."),
});
export type AadharKycOutput = z.infer<typeof AadharKycOutputSchema>;

export async function aadharKycFlow(input: AadharKycInput): Promise<AadharKycOutput> {
  return aadharKycFlowRunner(input);
}

const prompt = ai.definePrompt({
  name: 'aadharKycPrompt',
  input: {schema: AadharKycInputSchema},
  output: {schema: AadharKycOutputSchema},
  prompt: `You are an expert KYC verification agent. 

Your task is to analyze the provided image of an Indian Aadhar card and extract the following information accurately:
1.  **Full Name**: The complete name of the cardholder.
2.  **Aadhar Number**: The 12-digit unique identification number.

Please return the extracted information in the specified JSON format. Ensure the Aadhar number is formatted with spaces as 'XXXX XXXX XXXX'.

Aadhar Card Image: {{media url=aadharCardDataUri}}`,
});

const aadharKycFlowRunner = ai.defineFlow(
  {
    name: 'aadharKycFlow',
    inputSchema: AadharKycInputSchema,
    outputSchema: AadharKycOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
