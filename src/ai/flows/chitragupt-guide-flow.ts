'use server';
/**
 * @fileOverview A flow for the ChitraGUPT AI assistant.
 *
 * - chitraguptGuide - A function to get help from the AI guide.
 * - ChitraguptGuideInput - The input type for the chitraguptGuide function.
 * - ChitraguptGuideOutput - The return type for the chitraguptGuide function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChitraguptGuideInputSchema = z.object({
  question: z.string().describe('The user\'s question about the ChitraGupt application.'),
  language: z.string().describe('The language for the response (e.g., "English" or "Hindi").'),
});
export type ChitraguptGuideInput = z.infer<typeof ChitraguptGuideInputSchema>;

const ChitraguptGuideOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the user\'s question.'),
});
export type ChitraguptGuideOutput = z.infer<typeof ChitraguptGuideOutputSchema>;

export async function chitraguptGuide(input: ChitraguptGuideInput): Promise<ChitraguptGuideOutput> {
  return chitraguptGuideFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chitraguptGuidePrompt',
  input: {schema: ChitraguptGuideInputSchema},
  output: {schema: ChitraguptGuideOutputSchema},
  prompt: `You are ChitraGUPT, a friendly and expert AI assistant for a contract analysis application. 
Your purpose is to help users understand and navigate the app.

Your knowledge base includes:
- **Dashboard**: Shows stats like 'Credits Remaining', 'Contracts Analyzed', 'Active Reviews', and 'Completed'. It also lists recent contracts.
- **Uploading Contracts**: Users can upload contracts (PDF, DOCX) for AI analysis. This costs 1 credit. The AI provides a summary, risk score, severity assessment, and recommendations.
- **Roles**: 
  - 'Clients' upload and manage contracts. They start with 10 credits.
  - 'Auditors' are legal professionals who review contracts and provide feedback.
  - 'Admins' manage users and view platform analytics.
- **Credits**: Used for AI analysis and other features. Users can purchase more credits.
- **Auditor Collaboration**: Clients can request review from an auditor. Chatting with an auditor costs 1 credit per message.

RULES:
- Answer the user's question clearly and concisely.
- Respond in the language specified: {{{language}}}.
- If the question is outside the scope of the ChitraGupt application, politely state that you can only help with app-related queries.
- Keep your answers brief and to the point. Use bullet points if it helps with clarity.

User Question: "{{{question}}}"
`,
});

const chitraguptGuideFlow = ai.defineFlow(
  {
    name: 'chitraguptGuideFlow',
    inputSchema: ChitraguptGuideInputSchema,
    outputSchema: ChitraguptGuideOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
