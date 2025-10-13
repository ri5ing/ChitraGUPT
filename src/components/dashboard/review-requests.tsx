'use client';

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Loader2, X, Eye } from "lucide-react";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import type { ReviewRequest, UserProfile, AIAnalysisReport } from "@/types";
import { collection, query, where, doc, writeBatch } from "firebase/firestore";
import { format } from "date-fns";
import { enIN } from "date-fns/locale";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useDoc } from "@/firebase/firestore/use-doc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const getRiskColor = (score: number) => {
  if (score > 75) return 'bg-destructive';
  if (score > 50) return 'bg-yellow-500';
  return 'bg-green-600';
};

const getSeverityBadgeClass = (severity?: AIAnalysisReport['documentSeverity']) => {
    switch (severity) {
      case 'Critical': return 'bg-red-600 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-yellow-500 text-black';
      case 'Low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
}


function RequestDetailsDialog({ request }: { request: ReviewRequest }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
          <span className="sr-only">View Details</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Review Request Details</DialogTitle>
          <DialogDescription>
            Contract: <span className="font-semibold">{request.contractTitle}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div>
                <h4 className="font-semibold text-sm mb-1">Client</h4>
                <p className="text-sm text-muted-foreground">{request.clientName}</p>
            </div>
             <div>
                <h4 className="font-semibold text-sm mb-1">Proposed Budget</h4>
                <p className="text-sm text-muted-foreground">{request.budget ? `₹${request.budget.toLocaleString('en-IN')}` : 'Not specified'}</p>
            </div>
            <div>
                <h4 className="font-semibold text-sm mb-1">Key Concerns from Client</h4>
                <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md">{request.clientConcerns || 'No specific concerns raised.'}</p>
            </div>
           {request.shareAiSummary && request.aiSummary && (
                <div>
                    <h4 className="font-semibold text-sm mb-1">AI-Generated Summary (Sanitized)</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground p-3 bg-muted rounded-md">
                        {request.aiSummary.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  )
}


export function ReviewRequests() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const pendingRequestsQuery = useMemoFirebase(() => {
    if (!firestore || !user || userProfile?.role !== 'auditor') return null;
    return query(
      collection(firestore, 'reviewRequests'),
      where('auditorId', '==', user.uid),
      where('status', '==', 'pending')
    );
  }, [firestore, user, userProfile]);

  const { data: requests, isLoading: isRequestsLoading, error } = useCollection<ReviewRequest>(pendingRequestsQuery);

  const handleUpdateRequest = async (request: ReviewRequest, newStatus: 'accepted' | 'rejected') => {
    setIsUpdating(request.id);
    try {
        const batch = writeBatch(firestore);

        const requestRef = doc(firestore, 'reviewRequests', request.id);
        batch.update(requestRef, { status: newStatus });

        const contractRef = doc(firestore, `users/${request.contractUserId}/contracts`, request.contractId);
        
        if (newStatus === 'rejected') {
            batch.update(contractRef, { 
                status: 'Action Required',
                auditorId: null 
            });
        } else { // accepted
            batch.update(contractRef, {
                status: 'In Review'
            });
        }
        
        await batch.commit();

        toast({
            title: `Request ${newStatus}`,
            description: `The request for "${request.contractTitle}" has been ${newStatus}.`
        });
    } catch(err) {
        console.error(err);
        toast({
            variant: 'destructive',
            title: "Update failed",
            description: "Could not update the request status."
        })
    } finally {
        setIsUpdating(null);
    }
  };

  const renderContent = () => {
    const isLoading = isUserLoading || isRequestsLoading;
    if (isLoading) {
      return (
          [...Array(2)].map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-5 w-32" /></TableCell>
              <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
              <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
            </TableRow>
          ))
      );
    }
    
    if (error) {
      return <TableRow><TableCell colSpan={5} className="text-center text-destructive p-4">Error loading new requests.</TableCell></TableRow>
    }

    if (!requests || requests.length === 0) {
      return <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground p-8">You have no new review requests.</TableCell></TableRow>
    }

    return (
      requests.map((request) => (
        <TableRow key={request.id}>
          <TableCell>
            <div className="font-medium">{request.contractTitle}</div>
          </TableCell>
          <TableCell className="hidden md:table-cell">
            {request.clientName}
          </TableCell>
          <TableCell className="hidden lg:table-cell">
             {request.requestDate ? format(request.requestDate.toDate(), 'P', { locale: enIN }) : 'N/A'}
          </TableCell>
          <TableCell className="hidden sm:table-cell">
            <div className="flex items-center gap-2">
                {typeof request.riskScore === 'number' && (
                    <Badge variant="outline" className={cn('border-2', getRiskColor(request.riskScore))}>{request.riskScore}</Badge>
                )}
                {request.documentSeverity && (
                    <Badge className={cn(getSeverityBadgeClass(request.documentSeverity))}>{request.documentSeverity}</Badge>
                )}
            </div>
          </TableCell>
          <TableCell className="text-right space-x-1">
             <RequestDetailsDialog request={request} />
             <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handleUpdateRequest(request, 'accepted')}
                disabled={isUpdating === request.id}
                className="text-green-600 hover:text-green-700"
             >
                {isUpdating === request.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Check className="h-4 w-4"/>}
                <span className="sr-only">Accept</span>
             </Button>
             <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handleUpdateRequest(request, 'rejected')}
                disabled={isUpdating === request.id}
                className="text-red-600 hover:text-red-700"
             >
                {isUpdating === request.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <X className="h-4 w-4"/>}
                 <span className="sr-only">Reject</span>
             </Button>
          </TableCell>
        </TableRow>
      ))
    );
  }

  if (userProfile?.role !== 'auditor') {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Review Requests</CardTitle>
        <CardDescription>
          Accept or reject new contract review requests from clients.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contract</TableHead>
              <TableHead className="hidden md:table-cell">Client</TableHead>
              <TableHead className="hidden lg:table-cell">Received</TableHead>
              <TableHead className="hidden sm:table-cell">AI Snapshot</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {renderContent()}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
