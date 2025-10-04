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
import { aadharKycFlow } from '@/ai/flows/aadhar-kyc-flow';
import { useToast } from '@/hooks/use-toast';
import { fileToDataUri } from '@/lib/utils';


type ClientRegistrationFormProps = {
    onSubmit: (data: any) => void;
    isLoading: boolean;
    onBack: () => void;
};

export function ClientRegistrationForm({ onSubmit, isLoading, onBack }: ClientRegistrationFormProps) {
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

    // Only scan if a file is selected
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
                description: "Could not extract information from the uploaded document. You can proceed without it.",
            });
            // We don't block registration if KYC fails
        } finally {
            setIsScanningKyc(false);
        }
    }

    const formData = new FormData(event.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    onSubmit({ ...data, ...kycData });
  };
  
  const totalLoading = isLoading || isScanningKyc;

  return (
    <Card>
      <form onSubmit={handleFormSubmit}>
        <CardHeader>
          <CardTitle>Client Details</CardTitle>
          <CardDescription>Tell us a bit more about yourself.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number (मोबाइल नंबर)</Label>
            <Input id="mobile" name="mobile" type="tel" placeholder="e.g., 98765 43210" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="organization">Organization (Optional) (संगठन (वैकल्पिक))</Label>
            <Input id="organization" name="organization" type="text" placeholder="e.g., Innovate Inc." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="motive">Motive for using ChitraGupt (चित्रगुप्त का उपयोग करने का उद्देश्य)</Label>
            <Textarea id="motive" name="motive" placeholder="e.g., To analyze vendor contracts" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kyc">Upload Aadhar Card (Optional) (आधार कार्ड अपलोड करें (वैकल्पिक))</Label>
            <Input id="kyc" name="kyc" type="file" accept="image/*,application/pdf" onChange={handleFileChange} />
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
