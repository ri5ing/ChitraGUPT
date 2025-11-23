'use client';

import React, { useState, useMemo } from "react";
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
} from "@/components/ui/card";
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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import type { Contract } from "@/types";
import { collection, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import { format } from "date-fns";
import { enIN } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { ContractAnalysis } from "@/components/dashboard/contract-analysis";
import { useToast } from "@/hooks/use-toast";
import { UploadContractDialog } from "@/components/dashboard/upload-contract-dialog";
import { EditableTitle } from "@/components/dashboard/editable-title";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type ContractStatus = 'All' | 'In Review' | 'Completed' | 'Action Required';

export default function AllContractsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [expandedContractId, setExpandedContractId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ContractStatus>('All');
  const { toast } = useToast();

  const contractsQuery = useMemoFirebase(() => {
    if (!user) return null;
    const contractsRef = collection(firestore, `users/${user.uid}/contracts`);
    return query(contractsRef, orderBy('uploadDate', 'desc'));
  }, [firestore, user]);

  const { data: contracts, isLoading: isContractsLoading, error } = useCollection<Contract>(contractsQuery);

  const filteredContracts = useMemo(() => {
    if (!contracts) return [];
    if (activeTab === 'All') return contracts;
    return contracts.filter(c => c.status === activeTab);
  }, [contracts, activeTab]);

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
  
  const handleDeleteContract = async (contractId: string) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to delete a contract.' });
        return;
    }
    const contractRef = doc(firestore, 'users', user.uid, 'contracts', contractId);
    try {
        await deleteDoc(contractRef);
        toast({ title: 'Contract Deleted', description: 'The contract has been successfully deleted.' });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Deletion Failed', description: 'There was an error deleting the contract.' });
        console.error("Error deleting contract:", error);
    }
  };

  const renderContent = () => {
    if (isUserLoading || isContractsLoading) {
      return (
        [...Array(5)].map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
            <TableCell className="text-right space-x-2">
                <Skeleton className="h-8 w-[70px] inline-block" />
                <Skeleton className="h-8 w-8 inline-block" />
            </TableCell>
          </TableRow>
        ))
      );
    }
    
    if (error) {
      return <TableRow><TableCell colSpan={4} className="text-center text-destructive p-4">Error loading contracts.</TableCell></TableRow>
    }

    if (!filteredContracts || filteredContracts.length === 0) {
      return <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground p-8">No contracts found for this status.</TableCell></TableRow>
    }

    return (
      filteredContracts.map((contract) => (
        <React.Fragment key={contract.id}>
          <TableRow>
            <TableCell>
              <EditableTitle contract={contract} />
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {contract.uploadDate ? format(contract.uploadDate.toDate(), 'P', { locale: enIN }) : 'N/A'}
            </TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(contract.status)} className="capitalize">
                {contract.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => handleToggleRow(contract.id)}>
                    {expandedContractId === contract.id ? <ChevronUp/> : <ChevronDown/>}
                    <span className="ml-2 hidden sm:inline">View</span>
                </Button>
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the contract
                        and all associated analysis data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteContract(contract.id)} className="bg-destructive hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </TableCell>
          </TableRow>
          {expandedContractId === contract.id && (
            <TableRow>
              <TableCell colSpan={4}>
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
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
            <h2 className="text-2xl font-bold tracking-tight font-headline">All Contracts</h2>
            <p className="text-muted-foreground">Manage and review all your uploaded contracts.</p>
            </div>
            <div className="flex items-center gap-2">
            <UploadContractDialog />
            </div>
        </div>
        <Card>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ContractStatus)} className="w-full">
              <div className="p-4 border-b">
                <TabsList>
                  <TabsTrigger value="All">All</TabsTrigger>
                  <TabsTrigger value="In Review">In Review</TabsTrigger>
                  <TabsTrigger value="Completed">Completed</TabsTrigger>
                  <TabsTrigger value="Action Required">Action Required</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value={activeTab}>
                <CardContent className="pt-0">
                    <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Contract Title</TableHead>
                            <TableHead className="hidden md:table-cell">Uploaded</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {renderContent()}
                    </TableBody>
                    </Table>
                </CardContent>
              </TabsContent>
            </Tabs>
        </Card>
    </div>
  );
}
