'use client';

import type { AIAnalysisReport, Contract, UserProfile, AuditorProfile, AuditorFeedback } from '@/types';
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
  Bot,
  MessageSquareQuote,
  Users,
  BrainCircuit,
  AlertTriangle,
  FileJson,
  CheckCircle,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  UserPlus,
} from 'lucide-react';
import { format } from 'date-fns';
import { enIN } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ChatDialog } from '../chitragupt-guide/chat-dialog';
import { AuditorChatDialog } from './auditor-chat-dialog';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, increment, writeBatch, arrayUnion } from 'firebase/firestore';
import { AvailableAuditors } from './available-auditors';
import { ShareReportButton } from './share-report-button';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { RecommendAuditorDialog } from './recommend-auditor-dialog';

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

const getVerdictBadgeClass = (verdict?: AuditorFeedback['verdict']) => {
    switch(verdict) {
        case 'Approved': return 'bg-green-600 text-white';
        case 'Approved with Revisions': return 'bg-yellow-500 text-black';
        case 'Action Required': return 'bg-red-600 text-white';
        default: return 'bg-gray-500 text-white';
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
  const { user } = useUser();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const analysis = contract.aiAnalysis;
  const riskScore = analysis?.riskScore ?? 0;

  const summaryPoints = ensureArray(analysis?.summary);
  const riskAssessmentPoints = ensureArray(analysis?.riskAssessment);
  const missingClausesPoints = ensureArray(analysis?.missingClauses);
  const recommendationsPoints = ensureArray(analysis?.recommendations);

  const auditorsQuery = useMemoFirebase(() => {
    if (!firestore || !contract.auditorIds || contract.auditorIds.length === 0) return null;
    return collection(firestore, 'users'); // We will filter on the client side
  }, [firestore, contract.auditorIds]);

  const { data: allAuditors } = useCollection<UserProfile>(auditorsQuery);

  const auditorProfiles = useMemo(() => {
    if (!allAuditors || !contract.auditorIds) return [];
    return allAuditors.filter(auditor => contract.auditorIds!.includes(auditor.id));
  }, [allAuditors, contract.auditorIds]);


  const clientRef = useMemoFirebase(() => 
    doc(firestore, 'users', contract.userId),
  [firestore, contract.userId]);

  const { data: clientProfile } = useDoc<UserProfile>(clientRef);
  
  const isClientOwner = user?.uid === contract.userId;

  const handleClientApproval = async (decision: 'completed' | 'in_review') => {
    if (!user || !contract.auditorIds) return;
    setIsUpdating(true);

    try {
        const batch = writeBatch(firestore);

        const contractRef = doc(firestore, 'users', user.uid, 'contracts', contract.id);
        
        if (decision === 'completed') {
            batch.update(contractRef, { status: 'Completed' });
            
            // The auditor's work is now officially done.
            for (const auditorId of contract.auditorIds) {
                const auditorUserRef = doc(firestore, 'users', auditorId);
                const auditorPublicRef = doc(firestore, 'auditors', auditorId);
                batch.update(auditorUserRef, { currentActiveContracts: increment(-1) });
                batch.update(auditorPublicRef, { currentActiveContracts: increment(-1) });
            }
            
            // Delete the temporary review requests
            if(contract.reviewRequestIds) {
                for(const requestId of contract.reviewRequestIds) {
                    const requestRef = doc(firestore, 'reviewRequests', requestId);
                    batch.delete(requestRef);
                }
            }

            toast({ title: 'Review Approved', description: 'The contract has been marked as completed.' });

        } else { // Requesting revisions
            batch.update(contractRef, { status: 'In Review' });
            toast({ title: 'Revisions Requested', description: 'The contract has been sent back to the auditors for revisions.' });
        }

        await batch.commit();

    } catch (error: any) {
        console.error("Error updating contract status:", error);
        toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
    } finally {
        setIsUpdating(false);
    }
  };

  const renderAuditorReviewContent = () => {
    switch (contract.status) {
      case 'Completed':
        return (
          <div className="p-4 rounded-lg border bg-secondary/50 space-y-4">
            <div className='flex items-center gap-2'>
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h4 className="font-semibold text-lg">Review Completed</h4>
            </div>
            {contract.finalFeedback ? (
              <>
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={contract.finalFeedback.auditorAvatarUrl} />
                    <AvatarFallback>{contract.finalFeedback.auditorName?.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{contract.finalFeedback.auditorName}</p>
                  </div>
                </div>
                <div>
                  <p className='text-sm font-semibold'>Final Verdict</p>
                  <Badge className={cn('mt-1', getVerdictBadgeClass(contract.finalFeedback.verdict))}>{contract.finalFeedback.verdict}</Badge>
                </div>
                <div>
                  <p className='text-sm font-semibold'>Auditor's Notes</p>
                  <p className='text-sm text-muted-foreground p-3 mt-1 bg-background rounded-md border'>{contract.finalFeedback.feedback}</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">This contract was completed without a final auditor review.</p>
            )}
          </div>
        );

      case 'In Review':
      case 'Pending Approval':
        if (!contract.auditorIds || contract.auditorIds.length === 0) {
          // This case shouldn't happen if logic is correct, but as a fallback:
          return <p className="text-center text-muted-foreground py-6">Assigning an auditor...</p>;
        }
        return (
          <>
            <div className="p-4 rounded-lg border bg-secondary/50">
              <h4 className="font-semibold mb-2">Assigned Auditors</h4>
              <div className='space-y-3'>
                {auditorProfiles.map(profile => (
                  <div key={profile.id} className="flex items-center gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={profile.avatarUrl} />
                      <AvatarFallback>{profile.displayName?.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{profile.displayName}</p>
                      <p className="text-xs text-muted-foreground">{profile.firm || 'Independent'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {isClientOwner && (
              <div className="text-center text-sm p-2 rounded-md bg-blue-50 border border-blue-200 text-blue-800">
                <p>You can add more auditors to this review.</p>
                <AvailableAuditors contract={contract} buttonContent={<><UserPlus className="mr-2 h-4 w-4" />Add Another Auditor</>} />
              </div>
            )}
            {clientProfile && auditorProfiles.length > 0 && (
              <AuditorChatDialog contract={contract} auditorProfiles={auditorProfiles} clientProfile={clientProfile} />
            )}
            {isClientOwner && contract.status === 'Pending Approval' && contract.finalFeedback && (
              <Card className="bg-amber-50 border-amber-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><RefreshCw className="h-5 w-5 text-amber-600" /> Awaiting Your Approval</CardTitle>
                  <CardDescription>The auditor has submitted their final review. Please approve the work or request revisions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className='text-sm font-semibold'>Auditor's Verdict</p>
                    <Badge className={cn('mt-1', getVerdictBadgeClass(contract.finalFeedback.verdict))}>{contract.finalFeedback.verdict}</Badge>
                  </div>
                  <div>
                    <p className='text-sm font-semibold'>Auditor's Notes</p>
                    <p className='text-sm text-muted-foreground p-3 mt-1 bg-background rounded-md border'>{contract.finalFeedback.feedback}</p>
                  </div>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button onClick={() => handleClientApproval('completed')} disabled={isUpdating} className="flex-1 bg-green-600 hover:bg-green-700">
                    {isUpdating ? <Loader2 className="animate-spin" /> : <ThumbsUp className="mr-2" />}
                    Approve & Complete
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" disabled={isUpdating} className="flex-1">
                        {isUpdating ? <Loader2 className="animate-spin" /> : <ThumbsDown className="mr-2" />}
                        Request Revisions
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Request Revisions?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will send the contract back to the auditor's queue for more work. Are you sure?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleClientApproval('in_review')}>
                          Yes, Request Revisions
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            )}
          </>
        );

      case 'Pending':
      case 'Action Required':
      default:
        return (
          <div className="text-center p-4 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">This contract is ready for an expert review.</p>
            <RecommendAuditorDialog contract={contract}>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" /> Request Auditor Review
              </Button>
            </RecommendAuditorDialog>
          </div>
        );
    }
  };


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
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                      <CardTitle className="text-sm font-medium flex items-center gap-2"><AlertTriangle size={16}/> Severity</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                      <Badge className={cn("text-base", getSeverityBadgeClass(analysis.documentSeverity))}>
                                          {analysis.documentSeverity ?? 'N/A'}
                                      </Badge>
                                  </CardContent>
                              </Card>
                               <Card>
                                  <CardHeader className="pb-2">
                                      <CardTitle className="text-sm font-medium flex items-center gap-2"><FileJson size={16}/> Type</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="font-semibold text-lg">{analysis.contractType ?? 'N/A'}</div>
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
      </div>

      <div className="lg:col-span-1 space-y-6">
        <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="text-accent" /> Auditor Review</CardTitle>
              <CardDescription>
                Professional feedback and annotations from certified auditors.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {renderAuditorReviewContent()}
              </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
