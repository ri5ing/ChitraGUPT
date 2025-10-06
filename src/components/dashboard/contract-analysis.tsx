'use client';

import type { AIAnalysisReport, Contract, UserProfile, AuditorProfile } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  FileText,
  GanttChartSquare,
  ListChecks,
  ShieldAlert,
  VenetianMask,
  Bot,
  MessageSquareQuote,
  Users,
  BrainCircuit,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';
import { enIN } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ChatDialog } from '../chitragupt-guide/chat-dialog';
import { RecommendAuditorDialog } from './recommend-auditor-dialog';
import { AuditorChatDialog } from './auditor-chat-dialog';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { AvailableAuditors } from './available-auditors';
import { ShareReportButton } from './share-report-button';

type ContractAnalysisProps = {
  contract: Contract;
};

const getRiskColor = (score: number) => {
  if (score > 75) return 'bg-destructive text-destructive-foreground';
  if (score > 50) return 'bg-yellow-500 text-yellow-foreground';
  return 'bg-green-600 text-green-foreground';
};

const getSeverityBadgeClass = (severity?: AIAnalysisReport['documentSeverity']) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-600 text-white';
      case 'High':
        return 'bg-orange-500 text-white';
      case 'Medium':
        return 'bg-yellow-500 text-black';
      case 'Low':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
}

// Helper to ensure the content is always an array
const ensureArray = (content: string | string[] | undefined): string[] => {
    if (Array.isArray(content)) return content;
    if (typeof content === 'string') return [content];
    return [];
}

export function ContractAnalysis({ contract }: ContractAnalysisProps) {
  const firestore = useFirestore();

  const analysis = contract.aiAnalysis;
  const riskScore = analysis?.riskScore ?? 0;

  const summaryPoints = ensureArray(analysis?.summary);
  const riskAssessmentPoints = ensureArray(analysis?.riskAssessment);
  const missingClausesPoints = ensureArray(analysis?.missingClauses);
  const recommendationsPoints = ensureArray(analysis?.recommendations);

  const auditorRef = useMemoFirebase(() => 
    contract.auditorId ? doc(firestore, 'auditors', contract.auditorId) : null, 
  [firestore, contract.auditorId]);

  const clientRef = useMemoFirebase(() => 
    doc(firestore, 'users', contract.userId),
  [firestore, contract.userId]);

  const { data: auditorProfile } = useDoc<AuditorProfile>(auditorRef);
  const { data: clientProfile } = useDoc<UserProfile>(clientRef);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
          <Card>
              <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2"><Bot className="text-accent" /> AI-Powered Report</CardTitle>
                      <CardDescription>
                      Analysis for <span className="font-semibold">{contract.title}</span>. This report is AI-generated and should be used as a guide.
                      </CardDescription>
                    </div>
                     {analysis && <ShareReportButton contract={contract} />}
                  </div>
              </CardHeader>
              <CardContent>
                  {!analysis ? (
                      <div className="text-center py-10">
                          <p className="text-muted-foreground">AI analysis is not available for this contract yet.</p>
                      </div>
                  ) : (
                      <div className='space-y-6'>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <Card>
                                  <CardHeader className="pb-2">
                                      <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                      <div className="text-4xl font-bold">{riskScore} <span className="text-lg text-muted-foreground">/ 100</span></div>
                                      <Progress value={riskScore} className="w-full mt-2 h-2" indicatorClassName={getRiskColor(riskScore)} />
                                  </CardContent>
                              </Card>
                               <Card>
                                  <CardHeader className="pb-2">
                                      <CardTitle className="text-sm font-medium flex items-center gap-2"><BrainCircuit size={16}/> AI Confidence</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                      <div className="text-4xl font-bold">{analysis.aiConfidenceScore ?? 'N/A'}%</div>
                                  </CardContent>
                              </Card>
                               <Card>
                                  <CardHeader className="pb-2">
                                      <CardTitle className="text-sm font-medium flex items-center gap-2"><AlertTriangle size={16}/> Document Severity</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                      <Badge className={cn("text-base", getSeverityBadgeClass(analysis.documentSeverity))}>
                                          {analysis.documentSeverity ?? 'N/A'}
                                      </Badge>
                                  </CardContent>
                              </Card>
                          </div>
                          
                          <Accordion type="multiple" defaultValue={['summary', 'risk-assessment']} className="w-full rounded-lg border">
                              <AccordionItem value="summary" className="px-4">
                                  <AccordionTrigger><GanttChartSquare className="mr-2 h-5 w-5 text-accent"/>Contract Summary</AccordionTrigger>
                                  <AccordionContent className="text-base leading-relaxed">
                                      <ul className="list-disc pl-5 space-y-2">
                                          {summaryPoints.map((item, index) => <li key={index}>{item}</li>)}
                                      </ul>
                                  </AccordionContent>
                              </AccordionItem>
                              <AccordionItem value="risk-assessment" className="px-4">
                                  <AccordionTrigger><ShieldAlert className="mr-2 h-5 w-5 text-accent"/>Risk Assessment</AccordionTrigger>
                                  <AccordionContent className="text-base leading-relaxed">
                                      <ul className="list-disc pl-5 space-y-2">
                                          {riskAssessmentPoints.map((item, index) => <li key={index}>{item}</li>)}
                                      </ul>
                                  </AccordionContent>
                              </AccordionItem>
                              <AccordionItem value="missing-clauses" className="px-4">
                                  <AccordionTrigger><ListChecks className="mr-2 h-5 w-5 text-accent"/>Missing Clauses</AccordionTrigger>
                                  <AccordionContent>
                                  <ul className="list-disc pl-5 space-y-2 text-base">
                                      {missingClausesPoints.map((clause, index) => <li key={index}>{clause}</li>)}
                                  </ul>
                                  </AccordionContent>
                              </AccordionItem>
                              <AccordionItem value="recommendations" className="px-4 border-b-0">
                                  <AccordionTrigger><FileText className="mr-2 h-5 w-5 text-accent"/>Recommendations</AccordionTrigger>
                                  <AccordionContent className="text-base leading-relaxed">
                                       <ul className="list-disc pl-5 space-y-2">
                                          {recommendationsPoints.map((item, index) => <li key={index}>{item}</li>)}
                                      </ul>
                                  </AccordionContent>
                              </AccordionItem>
                          </Accordion>
                      </div>
                  )}
              </CardContent>
               <CardFooter className="flex flex-col md:flex-row items-center gap-2 border-t pt-6">
                  <ChatDialog
                      contractContext={{
                          summary: summaryPoints,
                          riskAssessment: riskAssessmentPoints
                      }}
                  >
                      <Button className='w-full md:w-auto'>
                          <MessageSquareQuote className="mr-2 h-4 w-4" /> Chat with ChitraGUPT
                      </Button>
                  </ChatDialog>
                  <p className="text-xs text-muted-foreground">(1 credit for 3 chats)</p>
              </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="text-accent" /> Auditor Review</CardTitle>
              <CardDescription>
                Professional feedback and annotations from certified auditors.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {contract.auditorId && auditorProfile ? (
                  <>
                  <div className="p-4 rounded-lg border bg-secondary/50">
                    <h4 className="font-semibold mb-2">Auditor Assigned</h4>
                    <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                            <AvatarImage src={auditorProfile.avatarUrl} />
                            <AvatarFallback>{auditorProfile.displayName?.slice(0,2)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{auditorProfile.displayName}</p>
                            <p className="text-sm text-muted-foreground">{auditorProfile.firm || 'Independent'}</p>
                        </div>
                    </div>
                  </div>
                   {contract.auditorFeedback && contract.auditorFeedback.length > 0 ? (
                      contract.auditorFeedback.map(fb => (
                          <div key={fb.id} className="flex gap-4">
                              <Avatar>
                                  <AvatarImage src={fb.auditorAvatarUrl} />
                                  <AvatarFallback>{fb.auditorName.slice(0,2)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-1">
                                  <div className="flex items-center justify-between">
                                      <p className="font-semibold">{fb.auditorName}</p>
                                      <p className="text-xs text-muted-foreground">{fb.timestamp.toDateString()}</p>
                                  </div>
                                  <p className="text-sm text-muted-foreground p-3 bg-secondary rounded-lg">{fb.feedback}</p>
                              </div>
                          </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">Awaiting feedback from {auditorProfile.displayName}.</div>
                    )}
                    {clientProfile && auditorProfile && (
                      <AuditorChatDialog contract={contract} auditorProfile={auditorProfile} clientProfile={clientProfile} />
                    )}
                  </>
                ) : (
                  <div className="text-center py-10 rounded-lg border-2 border-dashed">
                    <VenetianMask className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">No Auditor Assigned</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Select an auditor from the list to request a review.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
      </div>

      <div className="lg:col-span-1 space-y-6">
        <AvailableAuditors contract={contract} />
      </div>
    </div>
  );
}
