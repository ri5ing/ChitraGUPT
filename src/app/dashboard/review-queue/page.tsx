
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
import { ChevronDown, ChevronUp } from "lucide-react";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import type { Contract } from "@/types";
import { collectionGroup, query, where } from "firebase/firestore";
import { format } from "date-fns";
import { enIN } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { ContractAnalysis } from "@/components/dashboard/contract-analysis";

export default function ReviewQueuePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [expandedContractId, setExpandedContractId] = useState<string | null>(null);

  const reviewQueueQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collectionGroup(firestore, 'contracts'),
      where('auditorId', '==', user.uid),
      where('status', '==', 'In Review')
    );
  }, [firestore, user]);

  const { data: contracts, isLoading: isContractsLoading, error } = useCollection<Contract>(reviewQueueQuery);

  const handleToggleRow = (contractId: string) => {
    setExpandedContractId(prevId => prevId === contractId ? null : contractId);
  };
  
  const renderContent = () => {
    const isLoading = isUserLoading || isContractsLoading;
    if (isLoading) {
      return (
          [...Array(3)].map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-5 w-32" /></TableCell>
              <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
              <TableCell><Skeleton className="h-6 w-20" /></TableCell>
              <TableCell className="text-right"><Skeleton className="h-8 w-[70px] ml-auto" /></TableCell>
            </TableRow>
          ))
      );
    }
    
    if (error) {
      return <TableRow><TableCell colSpan={5} className="text-center text-destructive p-4">Error loading review queue. You may not have permission to view this.</TableCell></TableRow>
    }

    if (!contracts || contracts.length === 0) {
      return <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground p-8">You have no contracts in your review queue.</TableCell></TableRow>
    }

    return (
      contracts.map((contract) => (
        <React.Fragment key={contract.id}>
          <TableRow>
            <TableCell>
              <div className="font-medium">{contract.title}</div>
            </TableCell>
             <TableCell className="hidden md:table-cell">
              {/* This would ideally show the client's name. Requires another query. */}
              <div className="text-muted-foreground text-xs">{contract.userId}</div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {contract.uploadDate ? format(contract.uploadDate.toDate(), 'P', { locale: enIN }) : 'N/A'}
            </TableCell>
            <TableCell>
              <Badge variant="secondary" className="capitalize">
                {contract.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => handleToggleRow(contract.id)}>
                    {expandedContractId === contract.id ? <ChevronUp/> : <ChevronDown/>}
                    <span className="ml-2 hidden sm:inline">View Details</span>
                </Button>
            </TableCell>
          </TableRow>
          {expandedContractId === contract.id && (
            <TableRow>
              <TableCell colSpan={5}>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <ContractAnalysis contract={contract} />
                </div>
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
            <h2 className="text-2xl font-bold tracking-tight font-headline">Review Queue</h2>
            <p className="text-muted-foreground">Contracts assigned to you for review.</p>
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
