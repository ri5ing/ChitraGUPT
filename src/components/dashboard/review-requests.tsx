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
import { Check, Loader2, X } from "lucide-react";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import type { ReviewRequest, UserProfile } from "@/types";
import { collection, query, where, doc, updateDoc, writeBatch } from "firebase/firestore";
import { format } from "date-fns";
import { enIN } from "date-fns/locale";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useDoc } from "@/firebase/firestore/use-doc";

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

        // Update the reviewRequest status
        const requestRef = doc(firestore, 'reviewRequests', request.id);
        batch.update(requestRef, { status: newStatus });

        // If rejected, update original contract to allow another request
        if (newStatus === 'rejected') {
            const contractRef = doc(firestore, `users/${request.contractUserId}/contracts`, request.contractId);
            batch.update(contractRef, { 
                status: 'Action Required', // or some other status
                auditorId: null 
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contract Title</TableHead>
              <TableHead className="hidden md:table-cell">Client</TableHead>
              <TableHead className="hidden md:table-cell">Received</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(2)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }
    
    if (error) {
      return <div className="text-center text-destructive p-4">Error loading new requests.</div>
    }

    if (!requests || requests.length === 0) {
      return <div className="text-center text-muted-foreground p-8">You have no new review requests.</div>
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contract Title</TableHead>
            <TableHead className="hidden md:table-cell">Client</TableHead>
            <TableHead className="hidden md:table-cell">Received</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>
                <div className="font-medium">{request.contractTitle}</div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {request.clientName}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {request.requestDate ? format(request.requestDate.toDate(), 'P', { locale: enIN }) : 'N/A'}
              </TableCell>
              <TableCell className="text-right space-x-2">
                 <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleUpdateRequest(request, 'accepted')}
                    disabled={isUpdating === request.id}
                 >
                    {isUpdating === request.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Check className="h-4 w-4 text-green-600"/>}
                    <span className="ml-2">Accept</span>
                 </Button>
                 <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleUpdateRequest(request, 'rejected')}
                    disabled={isUpdating === request.id}
                    >
                    {isUpdating === request.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <X className="h-4 w-4 text-red-600"/>}
                     <span className="ml-2">Reject</span>
                 </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  // Only render this component for auditors
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
        {renderContent()}
      </CardContent>
    </Card>
  );
}
