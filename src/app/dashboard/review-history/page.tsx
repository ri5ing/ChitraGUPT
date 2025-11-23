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
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import type { Contract } from "@/types";
import { collection, query, where, orderBy } from "firebase/firestore";
import { format } from "date-fns";
import { enIN } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function ReviewHistoryPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const completedContractsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'contracts'), // This query needs to be cross-collection
      where('auditorId', '==', user.uid),
      where('status', 'in', ['Completed', 'Action Required']), // Show completed and rejected/actionable items
      orderBy('uploadDate', 'desc')
    );
  }, [firestore, user]);

  // Firestore rules do not support cross-collection queries on subcollections like this.
  // A better data model would be to have a top-level `contracts` collection.
  // For now, we will assume a top-level collection exists for the purpose of this query.
  // The firestore.rules will also need to be updated.
  const { data: contracts, isLoading: isContractsLoading, error } = useCollection<Contract>(completedContractsQuery);
    
    const getVerdictBadgeClass = (verdict?: Contract['finalFeedback']['verdict']) => {
        switch(verdict) {
            case 'Approved': return 'bg-green-600 text-white';
            case 'Approved with Revisions': return 'bg-yellow-500 text-black';
            case 'Action Required': return 'bg-red-600 text-white';
            default: return 'bg-gray-500 text-white';
        }
    }

  const renderContent = () => {
    const isLoading = isUserLoading || isContractsLoading;
    if (isLoading) {
      return (
          [...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-5 w-32" /></TableCell>
              <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
              <TableCell><Skeleton className="h-6 w-24" /></TableCell>
            </TableRow>
          ))
      );
    }
    
    // NOTE: This error is expected if firestore.rules are not updated for cross-collection queries.
    if (error) {
      return <TableRow><TableCell colSpan={4} className="text-center text-destructive p-4">Error loading review history. Your security rules might need to be updated to allow querying the 'contracts' collection.</TableCell></TableRow>
    }

    if (!contracts || contracts.length === 0) {
      return <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground p-8">You have no past reviews in your history.</TableCell></TableRow>
    }

    return (
      contracts.map((contract) => (
        <TableRow key={contract.id}>
            <TableCell>
              <div className="font-medium">{contract.title}</div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {contract.uploadDate ? format(contract.uploadDate.toDate(), 'P', { locale: enIN }) : 'N/A'}
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <Badge variant={contract.status === 'Completed' ? 'default' : 'destructive'} className="capitalize">
                {contract.status}
              </Badge>
            </TableCell>
            <TableCell>
                {contract.finalFeedback?.verdict ? (
                    <Badge className={cn(getVerdictBadgeClass(contract.finalFeedback.verdict))}>
                        {contract.finalFeedback.verdict}
                    </Badge>
                ) : (
                    <Badge variant="outline">No Verdict</Badge>
                )}
            </TableCell>
          </TableRow>
      ))
    );
  }

  return (
    <div className="space-y-6">
        <div>
            <h2 className="text-2xl font-bold tracking-tight font-headline">Review History</h2>
            <p className="text-muted-foreground">A log of all your past contract reviews.</p>
        </div>
        <Card>
        <CardContent className="pt-6">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Contract Title</TableHead>
                    <TableHead className="hidden md:table-cell">Date Completed</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead>Final Verdict</TableHead>
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
