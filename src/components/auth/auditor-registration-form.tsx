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
import { aadharKycFlow } from '@/ai/flows/aadhar-kyc-flow';
import { useToast } from '@/hooks/use-toast';
import { fileToDataUri } from '@/lib/utils';

type AuditorRegistrationFormProps = {
    onSubmit: (data: any) => void;
    isLoading: boolean;
    onBack: () => void;
};

export function AuditorRegistrationForm({ onSubmit, isLoading, onBack }: AuditorRegistrationFormProps) {
  const [kycFile, setKycFile] = useState<File | null>(null);
  const [isScanningKyc, setIsScanningKyc] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setKycFile(file);
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    let kycData = {};

    if (kycFile) {
        setIsScanningKyc(true);
        try {
            const aadharCardDataUri = await fileToDataUri(kycFile);
            const kycResult = await aadharKycFlow({ aadharCardDataUri });
            kycData = {
                kyc: {
                    aadharName: kycResult.fullName,
                    aadharNumber: kycResult.aadharNumber,
                }
            };
            toast({
                title: "KYC Scanned Successfully",
                description: `Name: ${kycResult.fullName}`,
            });
        } catch (error) {
            console.error("KYC Scan failed:", error);
            toast({
                variant: 'destructive',
                title: "KYC Scan Failed",
                description: "Could not extract information from the uploaded document. Please ensure it's a clear image.",
            });
            setIsScanningKyc(false);
            return;
        } finally {
            setIsScanningKyc(false);
        }
    }

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    onSubmit({ ...data, ...kycData });
  };

  const totalLoading = isLoading || isScanningKyc;

  return (
    <Card>
      <form onSubmit={handleFormSubmit}>
        <CardHeader>
          <CardTitle>Auditor Details</CardTitle>
          <CardDescription>Please provide your professional details to join as an auditor.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number (मोबाइल नंबर)</Label>
              <Input id="mobile" name="mobile" type="tel" placeholder="e.g., 98765 43210" required />
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
            <Input id="kyc" name="kyc" type="file" accept="image/*,application/pdf" onChange={handleFileChange} required/>
            <p className="text-xs text-muted-foreground">This will be scanned to verify your identity.</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
            <Button variant="ghost" type="button" onClick={onBack} disabled={totalLoading}>Back</Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={totalLoading}>
                {totalLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isScanningKyc ? 'Scanning ID...' : (isLoading ? 'Creating Account...' : 'Complete Registration')}
            </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
