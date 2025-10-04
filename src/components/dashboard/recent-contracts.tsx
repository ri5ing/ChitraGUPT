'use client';

import Link from "next/link";
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
import { ArrowRight, FileWarning, Loader2 } from "lucide-react";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import type { Contract } from "@/types";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { format } from "date-fns";
import { Skeleton } from "../ui/skeleton";

export function RecentContracts() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

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

  const renderContent = () => {
    if (isUserLoading || isContractsLoading) {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contract Title</TableHead>
              <TableHead className="hidden sm:table-cell">Client</TableHead>
              <TableHead className="hidden md:table-cell">Uploaded</TableHead>
              <TableHead className="text-right">Status</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
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
            <TableHead className="hidden sm:table-cell">Client</TableHead>
            <TableHead className="hidden md:table-cell">Uploaded</TableHead>
            <TableHead className="text-right">Status</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.map((contract) => (
            <TableRow key={contract.id}>
              <TableCell>
                <div className="font-medium">{contract.title}</div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">{contract.clientName}</TableCell>
              <TableCell className="hidden md:table-cell">
                {contract.uploadDate ? format(contract.uploadDate.toDate(), 'PPP') : 'N/A'}
              </TableCell>
              <TableCell className="text-right">
                <Badge variant={getStatusVariant(contract.status)} className="capitalize">
                  {contract.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                  <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/contracts/${contract.id}`}>View</Link>
                  </Button>
              </TableCell>
            </TableRow>
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
