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
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, writeBatch } from 'firebase/firestore';
import type { UserProfile, AuditorProfile } from '@/types';
import { MultiSelect, type MultiSelectOption } from '../ui/multi-select';
import { Skeleton } from '../ui/skeleton';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle } from 'lucide-react';

const specializationOptions: MultiSelectOption[] = [
    { value: 'Corporate Law', label: 'Corporate Law' },
    { value: 'IP', label: 'Intellectual Property (IP)' },
    { value: 'Employment', label: 'Employment Law' },
    { value: 'Tax', label: 'Tax Law' },
    { value: 'International Trade', label: 'International Trade' },
    { value: 'Real Estate', label: 'Real Estate Law'},
    { value: 'Family Law', label: 'Family Law'},
    { value: 'Criminal Law', label: 'Criminal Law'},
    { value: 'Arbitration', label: 'Arbitration'},
    { value: 'Other', label: 'Other' },
];

export function UserProfileForm() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formState, setFormState] = useState<Partial<UserProfile>>({});

    const userProfileRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userProfile, isLoading: isProfileLoading, error } = useDoc<UserProfile>(userProfileRef);

    useEffect(() => {
        if (userProfile) {
            setFormState(userProfile);
        }
    }, [userProfile]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSpecializationChange = (selected: string[]) => {
        setFormState(prev => ({ ...prev, specialization: selected }));
    }

    const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!user || !userProfile) return;

        setIsLoading(true);

        try {
            const batch = writeBatch(firestore);

            const userRef = doc(firestore, 'users', user.uid);
            batch.update(userRef, formState);

            if (userProfile.role === 'auditor') {
                const auditorRef = doc(firestore, 'auditors', user.uid);
                const auditorProfileData: Partial<AuditorProfile> = {
                    displayName: formState.displayName,
                    firm: formState.firm,
                    specialization: formState.specialization,
                    experience: Number(formState.experience),
                };
                batch.update(auditorRef, auditorProfileData);
            }

            await batch.commit();
            toast({
                title: 'Profile Updated',
                description: 'Your profile has been successfully updated.',
            });
        } catch (e: any) {
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: e.message || 'An error occurred while updating your profile.',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    if (isUserLoading || isProfileLoading) {
        return (
             <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-32" />
                </CardFooter>
            </Card>
        );
    }
    
    if (error) {
        return (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Could not load your profile data. Please try again later.
              </AlertDescription>
            </Alert>
        )
    }

    if (!userProfile) {
        return <p>No profile data found.</p>;
    }


  return (
    <Card>
      <form onSubmit={handleFormSubmit}>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>This information will be displayed on your profile.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Full Name</Label>
                <Input id="displayName" name="displayName" value={formState.displayName || ''} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formState.email || ''} disabled />
              </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input id="mobile" name="mobile" type="tel" value={formState.mobile || ''} onChange={handleInputChange} />
          </div>

          {userProfile.role === 'client' && (
             <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Input id="organization" name="organization" value={formState.organization || ''} onChange={handleInputChange} />
            </div>
          )}

          {userProfile.role === 'auditor' && (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firm">Firm / Independent</Label>
                        <Input id="firm" name="firm" value={formState.firm || ''} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="experience">Years of Experience</Label>
                        <Input id="experience" name="experience" type="number" value={formState.experience || ''} onChange={handleInputChange} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <MultiSelect
                        options={specializationOptions}
                        selected={formState.specialization || []}
                        onChange={handleSpecializationChange}
                        placeholder="Select your areas of expertise..."
                        className="w-full"
                    />
                </div>
            </>
          )}

        </CardContent>
        <CardFooter>
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
