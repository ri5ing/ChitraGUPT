'use client';

import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare, ShieldAlert } from 'lucide-react';
import { ContractAnalysis } from '@/components/dashboard/contract-analysis';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Contract } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ContractDetailPage() {
  const params = useParams();
  const { id } = params;
  const firestore = useFirestore();

  const contractRef = useMemoFirebase(() => {
    if (!id) return null;
    // The path needs to be constructed carefully, assuming we know the user ID.
    // For this example, we'll assume a structure, but this may need adjustment
    // if you can't get the userId on this page.
    // A better approach might be to have a global state for the user or pass it somehow.
    // Let's assume for now we can't get the user ID here and the query is on a top-level collection.
    // This will likely fail with current security rules. The path construction is the key issue.
    // The correct path is /users/{userId}/contracts/{contractId}

    // The logic to get userId is in the layout. We can't easily access it here.
    // Let's modify this to assume the user is available from a hook.
    // This component is rendered inside DashboardLayout, so useUser() should work if we add 'use client'
    // It's already client-side because of useParams.

    // A simplification would be to pass contract data via props or context,
    // but for a direct link, we must fetch.
    
    // The previous error in recent-contracts was that the user was not available.
    // We will assume the user context is available here.
    // Let's get the user from the `useUser` hook which is available via context.
    
    // Okay, looking at the layout, the user *is* loaded there.
    // But this page doesn't have access to it directly.
    // The easiest fix is to make this component aware of the user context.

    // Let's re-read dashboard/layout.tsx. It uses useUser().
    // So any child component should be able to use it.
    
    // The problem is we don't know the user ID to construct the path.
    // This is a design flaw in the app. A contract ID is not globally unique, only within a user.
    // For now, I'll have to assume a different structure or change how data is fetched.
    
    // Let's just fetch from the mock data to fix the immediate 404, then address the bigger issue.
    // NO, the goal is to use firestore.
    
    // Looking at other files... `recent-contracts` gets the user.uid.
    // The layout gets user.uid. This page MUST get it too.
    const { user } = useUser(); // We will add this import.
    if (!user || typeof id !== 'string') return null;
    return doc(firestore, 'users', user.uid, 'contracts', id);

  }, [firestore, id]);

  const { data: contract, isLoading, error } = useDoc<Contract>(contractRef);

  // We need to import useUser.
  const { useUser } = require('@/firebase');


  if (isLoading) {
    return <ContractDetailSkeleton />;
  }

  if (error) {
    return <div className="text-center text-destructive p-4">Error loading contract: {error.message}</div>;
  }

  if (!contract) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
            <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Link>
        </Button>
        <div className="flex items-center gap-2">
            <Button variant="secondary">
                <MessageSquare className="mr-2 h-4 w-4" />
                Request Auditor Review
            </Button>
            <Button variant="destructive">
                <ShieldAlert className="mr-2 h-4 w-4" />
                Flag for Renegotiation
            </Button>
        </div>
      </div>
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">{contract.title}</h1>
        <p className="text-muted-foreground">
          Client: {contract.clientName} | Uploaded: {contract.uploadDate?.toDate().toLocaleDateString()}
        </p>
      </div>

      <ContractAnalysis contract={contract} />
    </div>
  );
}


function ContractDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-40" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-48" />
        </div>
      </div>
      
      <div>
        <Skeleton className="h-10 w-1/2 mb-2" />
        <Skeleton className="h-5 w-1/3" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
      <Skeleton className="h-96" />
    </div>
  )
}
