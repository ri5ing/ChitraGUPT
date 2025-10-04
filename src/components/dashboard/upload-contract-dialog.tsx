'use client';

import { useState } from 'react';
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
import { Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp, doc, runTransaction } from 'firebase/firestore';
import { contractSummaryAndRiskAssessment } from '@/ai/flows/contract-summary-and-risk-assessment';
import type { UserProfile } from '@/types';
import { Textarea } from '../ui/textarea';

function fileToDataUri(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}


export function UploadContractDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file || !user) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please select a file to upload.',
      });
      return;
    }

    setIsLoading(true);

    try {
        const userRef = doc(firestore, 'users', user.uid);
        
        // Check user's credit balance
        const currentUserProfile = await runTransaction(firestore, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
                throw new Error("User document doesn't exist!");
            }
            const profile = userDoc.data() as UserProfile;
            if (profile.creditBalance <= 0) {
                throw new Error('Insufficient credits');
            }
            return profile;
        });

      const contractDataUri = await fileToDataUri(file);
      const analysisResult = await contractSummaryAndRiskAssessment({ contractDataUri });

      const contractsRef = collection(firestore, 'users', user.uid, 'contracts');
      
      await runTransaction(firestore, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw new Error("User document doesn't exist!");
        }
        const currentBalance = userDoc.data().creditBalance;
        if (currentBalance <= 0) {
          throw new Error('Insufficient credits');
        }

        // Add new contract document, using the filename as the title
        transaction.set(doc(contractsRef), {
            title: file.name,
            description: description, // Optional description
            userId: user.uid,
            status: 'Completed',
            uploadDate: serverTimestamp(),
            fileName: file.name,
            aiAnalysis: {
                ...analysisResult,
                id: crypto.randomUUID(),
            },
            riskScore: analysisResult.riskScore,
            clientName: 'N/A' // No longer collecting this field in the form
        });

        // Decrement credit balance
        transaction.update(userRef, { creditBalance: currentBalance - 1 });
      });


      toast({
        title: 'Contract Analyzed',
        description: `${file.name} has been successfully uploaded and analyzed.`,
      });

      // Reset form and close dialog
      setFile(null);
      setDescription('');
      setOpen(false);
    } catch (error: any) {
      console.error('Error uploading and analyzing contract: ', error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: error.message || 'There was a problem with your contract.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
          <Upload className="mr-2 h-4 w-4" />
          Upload Contract
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Upload New Contract</DialogTitle>
            <DialogDescription>
              Select a document file to analyze. This will consume one credit.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contract-file" className="text-right">
                File
              </Label>
              <Input
                id="contract-file"
                type="file"
                onChange={handleFileChange}
                className="col-span-3"
                accept=".pdf,.doc,.docx,.txt"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="(Optional) Add any notes or context about this contract."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload & Analyze
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
