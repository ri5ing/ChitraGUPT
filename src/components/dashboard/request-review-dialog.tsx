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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { addDoc, collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import type { Contract, AuditorProfile, UserProfile } from '@/types';
import { Loader2, Send } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Checkbox } from '../ui/checkbox';

type RequestReviewDialogProps = {
  children: ReactNode;
  contract: Contract;
  auditor: AuditorProfile;
  currentUserProfile: UserProfile | null;
};

export function RequestReviewDialog({ children, contract, auditor, currentUserProfile }: RequestReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shareSummary, setShareSummary] = useState(true);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const handleSendRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user || !currentUserProfile) {
      toast({ variant: 'destructive', title: 'Error', description: 'You are not logged in.' });
      return;
    }
    
    if (!contract.aiAnalysis) {
       toast({ variant: 'destructive', title: 'Error', description: 'AI analysis must be complete before requesting a review.' });
      return;
    }

    setIsLoading(true);

    const formData = new FormData(event.target as HTMLFormElement);
    const budget = formData.get('budget');
    const clientConcerns = formData.get('clientConcerns');

    try {
      const batch = writeBatch(firestore);
      const reviewRequestRef = doc(collection(firestore, 'reviewRequests'));

      batch.set(reviewRequestRef, {
        contractId: contract.id,
        contractTitle: contract.title,
        contractUserId: contract.userId,
        clientId: user.uid,
        clientName: currentUserProfile.displayName || user.email,
        auditorId: auditor.id,
        status: 'pending',
        requestDate: serverTimestamp(),
        budget: budget ? Number(budget) : undefined,
        clientConcerns: clientConcerns as string || '',
        shareAiSummary: shareSummary,
        aiSummary: shareSummary ? contract.aiAnalysis.sanitizedSummary : [],
        riskScore: contract.aiAnalysis.riskScore,
        documentSeverity: contract.aiAnalysis.documentSeverity,
      });

      const contractRef = doc(firestore, 'users', user.uid, 'contracts', contract.id);
      batch.update(contractRef, {
        status: 'In Review',
        auditorId: auditor.id,
        reviewRequestId: reviewRequestRef.id // Store a reference to the request
      });
      
      await batch.commit();

      toast({
        title: 'Request Sent',
        description: `Your review request has been sent to ${auditor.displayName}.`,
      });
      setOpen(false);
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Request Review from {auditor.displayName}</DialogTitle>
          <DialogDescription>
            Provide details for the review of "{contract.title}". This will assign the contract to the auditor.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSendRequest} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="budget">Proposed Budget (₹)</Label>
            <Input id="budget" name="budget" type="number" placeholder="e.g., 5000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientConcerns">Key Concerns / Questions</Label>
            <Textarea id="clientConcerns" name="clientConcerns" placeholder="e.g., 'Please check the indemnity clause' or 'Is the notice period standard?'" />
          </div>
          <div className="flex items-center space-x-2 p-4 border rounded-md">
            <Switch id="share-summary" checked={shareSummary} onCheckedChange={setShareSummary} />
            <Label htmlFor="share-summary" className="flex-1 cursor-pointer">
              Share Sanitized AI Summary
              <p className="text-xs text-muted-foreground">Allow the auditor to see the AI-generated summary (confidential details removed).</p>
            </Label>
          </div>
          <div className="items-top flex space-x-2 p-4 border rounded-md">
            <Checkbox id="terms" checked={agreeToTerms} onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)} />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Accept terms and conditions
              </label>
              <p className="text-sm text-muted-foreground">
                You agree that the platform is not liable for the review and that canceled engagements may incur a fee.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading || !agreeToTerms}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Confirm & Send Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
