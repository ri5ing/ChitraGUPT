'use client';

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import type { PublicContractReport, AIAnalysisReport } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  FileText,
  GanttChartSquare,
  ListChecks,
  ShieldAlert,
  Bot,
  BrainCircuit,
  AlertTriangle,
  FileWarning,
  FileJson,
} from 'lucide-react';
import { format } from 'date-fns';
import { enIN } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/icons';
import Link from 'next/link';

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


function PublicReportSkeleton() {
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
            <Card>
                <CardHeader>
                    <div className="animate-pulse bg-muted h-8 w-3/4 rounded-md"></div>
                    <div className="animate-pulse bg-muted h-4 w-1/2 rounded-md mt-2"></div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="animate-pulse bg-muted h-24 rounded-md"></div>
                        <div className="animate-pulse bg-muted h-24 rounded-md"></div>
                        <div className="animate-pulse bg-muted h-24 rounded-md"></div>
                        <div className="animate-pulse bg-muted h-24 rounded-md"></div>
                    </div>
                    <div className="space-y-2">
                        <div className="animate-pulse bg-muted h-12 w-full rounded-md"></div>
                        <div className="animate-pulse bg-muted h-12 w-full rounded-md"></div>
                        <div className="animate-pulse bg-muted h-12 w-full rounded-md"></div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function PublicReportPage() {
  const params = useParams();
  const reportId = params.reportId as string;
  const firestore = useFirestore();

  const reportRef = useMemoFirebase(() => {
    if (!firestore || !reportId) return null;
    return doc(firestore, 'publicReports', reportId);
  }, [firestore, reportId]);

  const { data: report, isLoading, error } = useDoc<PublicContractReport>(reportRef);

  if (isLoading) {
    return <PublicReportSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md text-center p-8">
            <FileWarning className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="mt-4 text-2xl font-bold">Error</h2>
            <p className="mt-2 text-muted-foreground">Could not load the report. It's possible the link is invalid or there was a network issue.</p>
        </Card>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md text-center p-8">
            <FileWarning className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-2xl font-bold">Report Not Found</h2>
            <p className="mt-2 text-muted-foreground">The report you are looking for does not exist or may have been deleted.</p>
        </Card>
      </div>
    );
  }

  const analysis = report.analysis;
  const riskScore = analysis?.riskScore ?? 0;

  const summaryPoints = ensureArray(analysis?.summary);
  const riskAssessmentPoints = ensureArray(analysis?.riskAssessment);
  const missingClausesPoints = ensureArray(analysis?.missingClauses);
  const recommendationsPoints = ensureArray(analysis?.recommendations);

  return (
    <div className='min-h-screen bg-secondary/50'>
        <header className="bg-background border-b">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <Logo className="h-8 w-8 text-primary" />
                    <span className="text-xl font-bold font-headline">ChitraGupt</span>
                </Link>
                <div className="text-sm text-muted-foreground">Secure Report Viewer</div>
            </div>
        </header>
        <main className="max-w-4xl mx-auto p-4 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-3xl"><Bot className="text-accent h-8 w-8" /> AI-Powered Report</CardTitle>
                    <CardDescription className="pt-2">
                    Analysis for contract "<span className="font-semibold">{report.contractTitle}</span>", uploaded on {format(report.uploadDate.toDate(), 'PPP', { locale: enIN })}.
                    <br /> This report is AI-generated and should be used as a guide, not as a substitute for professional legal advice.
                    </CardDescription>
                </CardHeader>
                <CardContent>
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
                                    <CardTitle className="text-sm font-medium flex items-center gap-2"><AlertTriangle size={16}/> Document Severity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Badge className={cn("text-base", getSeverityBadgeClass(analysis.documentSeverity))}>
                                        {analysis.documentSeverity ?? 'N/A'}
                                    </Badge>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2"><FileJson size={16}/> Contract Type</CardTitle>
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
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
