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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type AuditorRegistrationFormProps = {
    onSubmit: (data: any) => void;
    isLoading: boolean;
    onBack: () => void;
};

export function AuditorRegistrationForm({ onSubmit, isLoading, onBack }: AuditorRegistrationFormProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Handle file upload for KYC
    console.log('KYC File for Auditor:', file);

    onSubmit(data);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Auditor Details</CardTitle>
          <CardDescription>Please provide your professional details to join as an auditor.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number (मोबाइल नंबर)</Label>
              <Input id="mobile" name="mobile" type="tel" placeholder="e.g., +1 555-555-5555" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="firm">Firm / Independent (फर्म / स्वतंत्र)</Label>
                <Input id="firm" name="firm" type="text" placeholder="e.g., Global Legal Associates" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialization">Specialization (विशेषज्ञता)</Label>
            <Select name="specialization" required>
                <SelectTrigger>
                    <SelectValue placeholder="Select your area of expertise (अपनी विशेषज्ञता का क्षेत्र चुनें)" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Corporate Law">Corporate Law</SelectItem>
                    <SelectItem value="IP">Intellectual Property (IP)</SelectItem>
                    <SelectItem value="Employment">Employment Law</SelectItem>
                    <SelectItem value="Tax">Tax Law</SelectItem>
                    <SelectItem value="International Trade">International Trade</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience (अनुभव के वर्ष)</Label>
                <Input id="experience" name="experience" type="number" placeholder="e.g., 10" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="certifications">Certifications (Optional) (प्रमाणपत्र (वैकल्पिक))</Label>
                <Input id="certifications" name="certifications" type="text" placeholder="e.g., CIPP/E" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="motive">Motive for joining (शामिल होने का उद्देश्य)</Label>
            <Textarea id="motive" name="motive" placeholder="e.g., To offer my expertise to a wider audience" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kyc">Upload Aadhar Card (PDF/Image) (आधार कार्ड अपलोड करें (पीडीएफ/छवि))</Label>
            <Input id="kyc" name="kyc" type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} required/>
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
