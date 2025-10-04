'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { User, Shield } from 'lucide-react';
import type { UserProfile } from '@/types';
import { ClientRegistrationForm } from './client-registration-form';
import { AuditorRegistrationForm } from './auditor-registration-form';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type Step = 'initial' | 'client' | 'auditor' | 'finalize';

export function RegisterForm() {
  const [step, setStep] = useState<Step>('initial');
  const [role, setRole] = useState<'client' | 'auditor' | null>(null);
  const [accountDetails, setAccountDetails] = useState({ email: '', password: '', name: '' });
  const [profileDetails, setProfileDetails] = useState<Partial<UserProfile>>({});

  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInitialSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!role) {
      setError('Please select a role.');
      return;
    }
    const name = (event.target as any).elements.name.value;
    const email = (event.target as any).elements.email.value;
    const password = (event.target as any).elements.password.value;
    setAccountDetails({ name, email, password });
    setStep(role);
  };
  
  const handleFinalSubmit = async (details: any) => {
    setIsLoading(true);
    setError(null);

    const finalProfileDetails = { ...profileDetails, ...details };

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, accountDetails.email, accountDetails.password);
      const user = userCredential.user;

      const userRef = doc(firestore, 'users', user.uid);
      
      const userProfileData: UserProfile = {
        id: user.uid,
        displayName: accountDetails.name,
        email: user.email!,
        role: role!,
        subscriptionPlan: 'Free',
        creditBalance: role === 'client' ? 10 : 0, // Clients get 10 free credits
        avatarUrl: `https://picsum.photos/seed/${user.uid}/100/100`,
        ...(finalProfileDetails as Partial<UserProfile>),
      };

      // Use setDoc and catch potential permission errors
      setDoc(userRef, userProfileData)
        .then(() => {
          router.push('/dashboard');
        })
        .catch((serverError) => {
          const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'create',
            requestResourceData: userProfileData,
          });

          // Emit the error for global handling
          errorEmitter.emit('permission-error', permissionError);

          // Also inform the user via toast
          toast({
            variant: "destructive",
            title: "Registration Error",
            description: "Could not create user profile. Please check permissions."
          });
          setIsLoading(false);
        });

    } catch (e: any) {
      setError(e.message);
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: e.message,
      });
      setIsLoading(false);
    }
  };


  const renderStep = () => {
    switch (step) {
      case 'initial':
        return (
          <Card>
            <form onSubmit={handleInitialSubmit}>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  First, let's get your basic account details.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name (पूरा नाम)</Label>
                  <Input id="name" type="text" placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (ईमेल)</Label>
                  <Input id="email" type="email" placeholder="name@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password (पासवर्ड)</Label>
                  <Input id="password" type="password" required />
                </div>
                <div className="space-y-3">
                  <Label>I am a... (मैं एक...)</Label>
                  <RadioGroup onValueChange={(value) => setRole(value as 'client' | 'auditor')} value={role ?? undefined} className="grid grid-cols-2 gap-4">
                    <div>
                      <RadioGroupItem value="client" id="client" className="peer sr-only" />
                      <Label
                        htmlFor="client"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <User className="mb-3 h-6 w-6" />
                        Client (ग्राहक)
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="auditor" id="auditor" className="peer sr-only" />
                      <Label
                        htmlFor="auditor"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <Shield className="mb-3 h-6 w-6" />
                        Auditor (लेखा परीक्षक)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                {error && <p className="text-sm font-medium text-destructive">{error}</p>}
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading || !role}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Next'}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Button variant="link" type="button" asChild className="h-auto p-0">
                    <Link href="/login">Sign in</Link>
                  </Button>
                </p>
              </CardFooter>
            </form>
          </Card>
        );
      case 'client':
        return <ClientRegistrationForm onSubmit={handleFinalSubmit} isLoading={isLoading} onBack={() => setStep('initial')} />;
      case 'auditor':
        return <AuditorRegistrationForm onSubmit={handleFinalSubmit} isLoading={isLoading} onBack={() => setStep('initial')} />;
      default:
        return null;
    }
  };

  return <div>{renderStep()}</div>;
}
