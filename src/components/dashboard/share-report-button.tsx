'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { addDoc, collection, doc, writeBatch } from 'firebase/firestore';
import type { Contract, PublicContractReport } from '@/types';
import { Check, Copy, Loader2, Share2 } from 'lucide-react';

type ShareReportButtonProps = {
  contract: Contract;
};

export function ShareReportButton({ contract }: ShareReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sharedLink, setSharedLink] = useState('');
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  useEffect(() => {
    if (open && contract.publicReportId) {
      const link = `${window.location.origin}/report/${contract.publicReportId}`;
      setSharedLink(link);
    }
  }, [open, contract.publicReportId]);

  const handleShare = async () => {
    if (!contract.aiAnalysis || !user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Analysis data is not available or you are not logged in.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const publicReport: Omit<PublicContractReport, 'id'> = {
        contractTitle: contract.title,
        uploadDate: contract.uploadDate,
        analysis: contract.aiAnalysis,
      };

      const batch = writeBatch(firestore);

      const publicReportRef = doc(collection(firestore, 'publicReports'));
      batch.set(publicReportRef, publicReport);
      
      const contractRef = doc(firestore, 'users', user.uid, 'contracts', contract.id);
      batch.update(contractRef, { publicReportId: publicReportRef.id });
      
      await batch.commit();
      
      const link = `${window.location.origin}/report/${publicReportRef.id}`;
      setSharedLink(link);

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to create share link',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sharedLink);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Reset state when closing, except for the generated link if it exists
      if (!contract.publicReportId) {
         setSharedLink('');
      }
      setHasCopied(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Report</DialogTitle>
          <DialogDescription>
            {sharedLink
              ? 'Anyone with this link can view a read-only version of the contract analysis.'
              : 'Generate a secure link to share this report.'}
          </DialogDescription>
        </DialogHeader>
        {sharedLink ? (
          <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="share-link">Shareable Link</Label>
                <div className="flex items-center space-x-2">
                    <Input id="share-link" value={sharedLink} readOnly />
                    <Button type="button" size="icon" onClick={copyToClipboard}>
                        {hasCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
            {hasCopied && <p className="text-sm text-green-600">Copied to clipboard!</p>}
          </div>
        ) : (
          <div className="flex items-center justify-center p-8">
            <Button
              type="button"
              onClick={handleShare}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Share2 className="mr-2 h-4 w-4" />
              )}
              Generate Secure Link
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
