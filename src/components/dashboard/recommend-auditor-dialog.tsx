'use client';

import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import type { AuditorProfile, Contract, UserProfile } from '@/types';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle, UserPlus } from 'lucide-react';
import { RequestReviewDialog } from './request-review-dialog';

type RecommendAuditorDialogProps = {
  children: ReactNode;
  contract: Contract;
};

export function RecommendAuditorDialog({ children, contract }: RecommendAuditorDialogProps) {
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: currentUserProfile } = useDoc<UserProfile>(userProfileRef);

  const auditorsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'auditors'));
  }, [firestore]);

  const { data: auditors, isLoading: isLoadingAuditors, error } = useCollection<AuditorProfile>(auditorsQuery);

  const renderContent = () => {
    if (isLoadingAuditors) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className='p-3 rounded-lg border'>
                <div className="flex flex-row items-center gap-4 pb-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Could not load the list of auditors. Please try again later.
          </AlertDescription>
        </Alert>
      );
    }

    if (auditors && auditors.length > 0) {
      return (
        <div className="space-y-4">
          {auditors.map((auditor) => (
             <RequestReviewDialog key={auditor.id} contract={contract} auditor={auditor} currentUserProfile={currentUserProfile}>
                <div className="w-full p-3 rounded-lg border text-left transition-colors flex items-start gap-4 hover:bg-accent/50 cursor-pointer">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={auditor.avatarUrl} alt={auditor.displayName} />
                        <AvatarFallback>{auditor.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="font-semibold">{auditor.displayName}</div>
                        <div className="text-sm text-muted-foreground">{auditor.firm || 'Independent'}</div>
                        {auditor.specialization && (
                            <div className="flex flex-wrap gap-1 mt-2">
                            {(Array.isArray(auditor.specialization) ? auditor.specialization : [auditor.specialization]).map(spec => (
                                <Badge key={spec} variant="secondary">{spec}</Badge>
                            ))}
                            </div>
                        )}
                    </div>
                </div>
            </RequestReviewDialog>
          ))}
        </div>
      );
    }

    return <p className="text-center text-muted-foreground py-10">No auditors found.</p>;
  }


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request an Auditor</DialogTitle>
          <DialogDescription>
            Select an expert to review your contract. They will be sent a request to begin the review process.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-96 my-4">
            <div className="space-y-4 pr-4">
              {renderContent()}
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
