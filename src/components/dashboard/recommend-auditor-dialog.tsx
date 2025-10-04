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
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, doc, updateDoc } from 'firebase/firestore';
import type { AuditorProfile } from '@/types';
import { Loader2, Send } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';

type RecommendAuditorDialogProps = {
  children: ReactNode;
  contractId: string;
};

export function RecommendAuditorDialog({ children, contractId }: RecommendAuditorDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAuditor, setSelectedAuditor] = useState<AuditorProfile | null>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const auditorsQuery = useMemoFirebase(() => {
    return query(collection(firestore, 'auditors'));
  }, [firestore]);

  const { data: auditors, isLoading: isLoadingAuditors } = useCollection<AuditorProfile>(auditorsQuery);

  const handleSendRequest = async () => {
    if (!user || !selectedAuditor) {
      toast({ variant: 'destructive', title: 'Error', description: 'No auditor selected or you are not logged in.' });
      return;
    }
    setIsLoading(true);
    
    try {
      const contractRef = doc(firestore, 'users', user.uid, 'contracts', contractId);
      await updateDoc(contractRef, {
        status: 'In Review',
        // In a real app, you would add this to a subcollection or a dedicated 'review_requests' collection.
        // For simplicity, we'll just update the status and assigned auditor ID.
        auditorId: selectedAuditor.id
      });

      toast({
        title: 'Request Sent',
        description: `Your request has been sent to ${selectedAuditor.displayName}.`,
      });
      setOpen(false);
      setSelectedAuditor(null);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to send request',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recommend an Auditor</DialogTitle>
          <DialogDescription>
            Select an auditor to request a review for your contract.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-72 my-4">
            <div className="space-y-4 pr-4">
            {isLoadingAuditors ? (
                <>
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </>
            ) : (auditors && auditors.length > 0) ? (
                auditors.map((auditor) => (
                    <button
                        key={auditor.id}
                        className={`w-full p-3 rounded-lg border text-left transition-colors flex items-start gap-4 ${selectedAuditor?.id === auditor.id ? 'border-primary bg-accent' : 'hover:bg-accent/50'}`}
                        onClick={() => setSelectedAuditor(auditor)}
                    >
                        <Avatar>
                            <AvatarImage src={auditor.avatarUrl} alt={auditor.displayName} />
                            <AvatarFallback>{auditor.displayName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="font-semibold">{auditor.displayName}</div>
                            <div className="text-sm text-muted-foreground">{auditor.firm}</div>
                             {auditor.specialization && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {(Array.isArray(auditor.specialization) ? auditor.specialization : [auditor.specialization]).map(spec => (
                                        <Badge key={spec} variant="secondary">{spec}</Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </button>
                ))
            ) : (
                <p className="text-center text-muted-foreground py-10">No auditors found.</p>
            )}
            </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSendRequest} disabled={!selectedAuditor || isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    