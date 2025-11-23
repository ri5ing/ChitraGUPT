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
import { ChevronDown, ChevronUp, CheckSquare } from "lucide-react";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import type { ReviewRequest, Contract, UserProfile } from "@/types";
import { collection, query, where, doc } from "firebase/firestore";
import { format } from "date-fns";
import { enIN } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { ContractAnalysis } from "@/components/dashboard/contract-analysis";
import { useDoc } from "@/firebase/firestore/use-doc";
import { FinalizeReviewDialog } from "@/components/dashboard/finalize-review-dialog";

function ExpandedRequestDetail({ request }: { request: ReviewRequest }) {
    const firestore = useFirestore();

    const contractRef = useMemoFirebase(() => {
        if (!firestore || !request) return null;
        // Note: The path to the contract must be constructed using the contract's owner ID (contractUserId)
        return doc(firestore, `users/${request.contractUserId}/contracts`, request.contractId);
    }, [firestore, request]);
    
    const { data: contract, isLoading, error } = useDoc<Contract>(contractRef);

    if (isLoading) {
        return <div className="p-4 text-center">Loading contract details...</div>
    }

    if (error) {
        return <div className="p-4 text-center text-destructive">Could not load contract details.</div>
    }

    if (!contract) {
        return <div className="p-4 text-center text-muted-foreground">Contract data not found.</div>
    }

    return (
      <div className="p-4 bg-muted/50 rounded-lg">
        <ContractAnalysis contract={contract} />
      </div>
    );
}


export default function ReviewQueuePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);

  const auditorProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: auditorProfile } = useDoc<UserProfile>(auditorProfileRef);

  const reviewQueueQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'reviewRequests'),
      where('auditorId', '==', user.uid),
      where('status', '==', 'accepted')
    );
  }, [firestore, user]);

  const { data: requests, isLoading: isRequestsLoading, error } = useCollection<ReviewRequest>(reviewQueueQuery);

  const handleToggleRow = (requestId: string) => {
    setExpandedRequestId(prevId => prevId === requestId ? null : requestId);
  };
  
  const renderContent = () => {
    const isLoading = isUserLoading || isRequestsLoading;
    if (isLoading) {
      return (
          [...Array(3)].map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-5 w-32" /></TableCell>
              <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
              <TableCell><Skeleton className="h-6 w-20" /></TableCell>
              <TableCell className="text-right space-x-2">
                <Skeleton className="h-8 w-[70px] inline-block" />
                <Skeleton className="h-8 w-24 inline-block" />
              </TableCell>
            </TableRow>
          ))
      );
    }
    
    if (error) {
      return <TableRow><TableCell colSpan={5} className="text-center text-destructive p-4">Error loading review queue. Please check your permissions.</TableCell></TableRow>
    }

    if (!requests || requests.length === 0) {
      return <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground p-8">You have no active contracts in your review queue.</TableCell></TableRow>
    }

    return (
      requests.map((request) => (
        <React.Fragment key={request.id}>
          <TableRow>
            <TableCell>
              <div className="font-medium">{request.contractTitle}</div>
            </TableCell>
             <TableCell className="hidden md:table-cell">
              <div className="font-medium">{request.clientName}</div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {request.requestDate ? format(request.requestDate.toDate(), 'P', { locale: enIN }) : 'N/A'}
            </TableCell>
            <TableCell>
              <Badge variant="secondary" className="capitalize">
                In Review
              </Badge>
            </TableCell>
            <TableCell className="text-right space-x-2">
                <Button variant="ghost" size="sm" onClick={() => handleToggleRow(request.id)}>
                    {expandedRequestId === request.id ? <ChevronUp/> : <ChevronDown/>}
                    <span className="ml-2 hidden sm:inline">Details</span>
                </Button>
                {auditorProfile && (
                    <FinalizeReviewDialog request={request} auditorProfile={auditorProfile}>
                        <Button size="sm">
                            <CheckSquare className="mr-2 h-4 w-4" />
                            Finalize
                        </Button>
                    </FinalizeReviewDialog>
                )}
            </TableCell>
          </TableRow>
          {expandedRequestId === request.id && (
            <TableRow>
              <TableCell colSpan={5}>
                <ExpandedRequestDetail request={request} />
              </TableCell>
            </TableRow>
          )}
        </React.Fragment>
      ))
    );
  }

  return (
    <div className="space-y-6">
        <div>
            <h2 className="text-2xl font-bold tracking-tight font-headline">Active Review Queue</h2>
            <p className="text-muted-foreground">Contracts you have accepted and are actively reviewing.</p>
        </div>
        <Card>
        <CardContent className="pt-6">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Contract Title</TableHead>
                    <TableHead className="hidden md:table-cell">Client</TableHead>
                    <TableHead className="hidden md:table-cell">Assigned</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                    {renderContent()}
                </TableBody>
            </Table>
        </CardContent>
        </Card>
    </div>
  );
}
