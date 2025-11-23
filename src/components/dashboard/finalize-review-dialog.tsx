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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import type { ReviewRequest, UserProfile, AuditorFeedback } from '@/types';
import { Loader2, Send } from 'lucide-react';
import { Textarea } from '../ui/textarea';

type FinalizeReviewDialogProps = {
  children: ReactNode;
  request: ReviewRequest;
  auditorProfile: UserProfile;
};

type Verdict = AuditorFeedback['verdict'];

export function FinalizeReviewDialog({ children, request, auditorProfile }: FinalizeReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | undefined>(undefined);
  const [feedback, setFeedback] = useState('');
  const { toast } = useToast();
  const firestore = useFirestore();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!verdict || !feedback) {
      toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please select a verdict and provide feedback.' });
      return;
    }

    setIsLoading(true);

    try {
      const batch = writeBatch(firestore);

      // 1. Reference to the original contract
      const contractRef = doc(firestore, 'users', request.contractUserId, 'contracts', request.contractId);

      // 2. Create the final feedback object
      const finalFeedbackData: Omit<AuditorFeedback, 'id'> = {
        contractId: request.contractId,
        auditorId: auditorProfile.id,
        auditorName: auditorProfile.displayName || auditorProfile.email,
        auditorAvatarUrl: auditorProfile.avatarUrl,
        feedback: feedback,
        verdict: verdict,
        timestamp: serverTimestamp() as any, // Cast to any to satisfy type temporarily
      };

      // 3. Update the original contract with status and final feedback
      batch.update(contractRef, {
        status: 'Pending Approval', // NEW STATUS: Waiting for client
        finalFeedback: finalFeedbackData,
      });

      await batch.commit();

      toast({
        title: 'Review Submitted',
        description: `Your feedback for "${request.contractTitle}" has been submitted for client approval.`,
      });
      setOpen(false);
      setVerdict(undefined);
      setFeedback('');

    } catch (error: any)
{
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error.message || 'There was an error finalizing the review.',
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
          <DialogTitle>Finalize Review for "{request.contractTitle}"</DialogTitle>
          <DialogDescription>
            Submit your final verdict and notes. This will send the review to the client for their final approval.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verdict">Final Verdict</Label>
            <Select onValueChange={(value: Verdict) => setVerdict(value)} value={verdict}>
              <SelectTrigger id="verdict">
                <SelectValue placeholder="Select a final status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Approved with Revisions">Approved with Revisions</SelectItem>
                <SelectItem value="Action Required">Action Required</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="feedback">Final Notes</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g., 'The contract is sound, but pay attention to clause 5b during negotiation...'"
              rows={6}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading || !verdict || !feedback}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Submit for Client Approval
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
