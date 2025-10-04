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
import type { AIAnalysisReport, UserProfile } from '@/types';

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
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
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
    if (!file || !title || !clientName || !user) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out all fields and select a file.',
      });
      return;
    }

    setIsLoading(true);

    try {
        const userRef = doc(firestore, 'users', user.uid);
        const currentUserProfile = (await runTransaction(firestore, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
                throw "User document doesn't exist!";
            }
            return userDoc.data() as UserProfile;
        }));

        if(currentUserProfile.creditBalance <= 0) {
            toast({
                variant: 'destructive',
                title: 'Insufficient Credits',
                description: 'You do not have enough credits to analyze a contract.',
            });
            setIsLoading(false);
            return;
        }

      const contractDataUri = await fileToDataUri(file);
      const analysisResult = await contractSummaryAndRiskAssessment({ contractDataUri });

      const contractsRef = collection(firestore, 'users', user.uid, 'contracts');
      
      await runTransaction(firestore, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw "User document doesn't exist!";
        }
        const currentBalance = userDoc.data().creditBalance;
        if (currentBalance <= 0) {
          throw 'Insufficient credits';
        }

        // Add new contract
        transaction.set(doc(contractsRef), {
            title,
            clientName,
            userId: user.uid,
            status: 'Completed',
            uploadDate: serverTimestamp(),
            fileName: file.name,
            aiAnalysis: {
                ...analysisResult,
                id: crypto.randomUUID(),
            },
            riskScore: analysisResult.riskScore,
        });

        // Decrement credit balance
        transaction.update(userRef, { creditBalance: currentBalance - 1 });
      });


      toast({
        title: 'Contract Analyzed',
        description: `${title} has been successfully uploaded and analyzed.`,
      });

      // Reset form and close dialog
      setFile(null);
      setTitle('');
      setClientName('');
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
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                placeholder="e.g. Master Services Agreement"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientName" className="text-right">
                Client Name
              </Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="col-span-3"
                placeholder="e.g. Innovate Corp"
                required
              />
            </div>
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
