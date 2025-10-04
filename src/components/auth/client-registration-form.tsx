'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

type ClientRegistrationFormProps = {
    onSubmit: (data: any) => void;
    isLoading: boolean;
    onBack: () => void;
};

export function ClientRegistrationForm({ onSubmit, isLoading, onBack }: ClientRegistrationFormProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Here you would handle the file upload and OCR for KYC
    // For now, we'll just pass the form data
    console.log('KYC File:', file);

    onSubmit(data);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Client Details</CardTitle>
          <CardDescription>Tell us a bit more about yourself.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input id="mobile" name="mobile" type="tel" placeholder="e.g., +1 555-555-5555" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="organization">Organization (Optional)</Label>
            <Input id="organization" name="organization" type="text" placeholder="e.g., Innovate Inc." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="motive">Motive for using ChitraGupt</Label>
            <Textarea id="motive" name="motive" placeholder="e.g., To analyze vendor contracts" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kyc">Upload Aadhar Card (PDF/Image)</Label>
            <Input id="kyc" name="kyc" type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <p className="text-xs text-muted-foreground">This will be scanned to verify your identity.</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
            <Button variant="ghost" type="button" onClick={onBack}>Back</Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Complete Registration'}
            </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
