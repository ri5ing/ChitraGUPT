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
import { useAuth, useFirestore, useFirebase } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export function UploadContractDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();
  const firestore = useFirestore();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
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
      const contractsRef = collection(firestore, 'users', user.uid, 'contracts');
      await addDoc(contractsRef, {
        title,
        clientName,
        userId: user.uid,
        status: 'Pending',
        uploadDate: serverTimestamp(),
        // In a real app, you would upload the file to Firebase Storage
        // and store the URL here. For now, we'll just use the file name.
        fileName: file.name,
      });

      toast({
        title: 'Contract Uploaded',
        description: `${title} has been successfully uploaded.`,
      });

      // Reset form and close dialog
      setFile(null);
      setTitle('');
      setClientName('');
      setOpen(false);
    } catch (error: any) {
      console.error('Error uploading contract: ', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.message || 'There was a problem uploading your contract.',
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
              Select a document file and provide the necessary details below.
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
                accept=".pdf,.doc,.docx"
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
