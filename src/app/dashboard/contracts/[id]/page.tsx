'use client';

import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare, ShieldAlert } from 'lucide-react';
import { ContractAnalysis } from '@/components/dashboard/contract-analysis';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Contract } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ContractDetailPage() {
  const params = useParams();
  const { id } = params;
  const firestore = useFirestore();
  const { user } = useUser();

  const contractRef = useMemoFirebase(() => {
    if (!user || typeof id !== 'string') return null;
    return doc(firestore, 'users', user.uid, 'contracts', id);
  }, [firestore, user, id]);

  const { data: contract, isLoading, error } = useDoc<Contract>(contractRef);

  if (isLoading) {
    return <ContractDetailSkeleton />;
  }

  if (error) {
    return <div className="text-center text-destructive p-4">Error loading contract: {error.message}</div>;
  }

  if (!contract) {
    notFound();
    return null; // notFound() doesn't return, but this satisfies TypeScript
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
          Uploaded: {contract.uploadDate?.toDate().toLocaleDateString()}
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
