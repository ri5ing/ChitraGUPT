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
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import type { Contract } from "@/types";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { format } from "date-fns";
import { enIN } from "date-fns/locale";
import { Skeleton } from "../ui/skeleton";
import { ContractAnalysis } from "./contract-analysis";
import Link from "next/link";

export function RecentContracts() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [expandedContractId, setExpandedContractId] = useState<string | null>(null);

  const contractsQuery = useMemoFirebase(() => {
    if (!user) return null;
    const contractsRef = collection(firestore, `users/${user.uid}/contracts`);
    return query(contractsRef, orderBy('uploadDate', 'desc'), limit(4));
  }, [firestore, user]);

  const { data: contracts, isLoading: isContractsLoading, error } = useCollection<Contract>(contractsQuery);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Completed":
        return "default";
      case "In Review":
        return "secondary";
      case "Action Required":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleToggleRow = (contractId: string) => {
    setExpandedContractId(prevId => prevId === contractId ? null : contractId);
  };

  const renderContent = () => {
    if (isUserLoading || isContractsLoading) {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contract Title</TableHead>
              <TableHead className="hidden md:table-cell">Uploaded</TableHead>
              <TableHead className="text-right">Status</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-6 w-20 ml-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-[70px]" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }
    
    if (error) {
      return <div className="text-center text-destructive p-4">Error loading contracts.</div>
    }

    if (!contracts || contracts.length === 0) {
      return <div className="text-center text-muted-foreground p-8">No contracts found. Upload one to get started!</div>
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contract Title</TableHead>
            <TableHead className="hidden md:table-cell">Uploaded</TableHead>
            <TableHead className="text-right">Status</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.map((contract) => (
            <React.Fragment key={contract.id}>
              <TableRow onClick={() => handleToggleRow(contract.id)} className="cursor-pointer">
                <TableCell>
                  <div className="font-medium">{contract.title}</div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {contract.uploadDate ? format(contract.uploadDate.toDate(), 'P', { locale: enIN }) : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={getStatusVariant(contract.status)} className="capitalize">
                    {contract.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                    <Button variant="outline" size="sm" >
                        {expandedContractId === contract.id ? <ChevronUp/> : <ChevronDown/>}
                        <span className="ml-2">View</span>
                    </Button>
                </TableCell>
              </TableRow>
              {expandedContractId === contract.id && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <ContractAnalysis contract={contract} />
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Contracts</CardTitle>
          <CardDescription>
            An overview of your most recent contract analyses.
          </CardDescription>
        </div>
        <Button variant="ghost" asChild>
            <Link href="#">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
