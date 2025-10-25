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
import { Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, writeBatch } from 'firebase/firestore';
import type { UserProfile, AuditorProfile } from '@/types';
import { MultiSelect, type MultiSelectOption } from '../ui/multi-select';
import { Skeleton } from '../ui/skeleton';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

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
    const [otherSpecialization, setOtherSpecialization] = useState('');

    const userProfileRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userProfile, isLoading: isProfileLoading, error } = useDoc<UserProfile>(userProfileRef);

    useEffect(() => {
        if (userProfile) {
            setFormState(userProfile);
            
            // Check if there's a specialization that isn't one of the predefined options
            const customSpec = userProfile.specialization?.find(s => 
                !specializationOptions.some(opt => opt.value === s)
            );

            if (customSpec) {
                // This is our custom "Other" value
                setOtherSpecialization(customSpec);

                // Ensure 'Other' is added to the selection to show the input box,
                // and the custom value itself is removed from the selection array
                // to avoid it being displayed as a badge.
                const newSpecializations = (userProfile.specialization || []).filter(s => s !== customSpec);
                if (!newSpecializations.includes('Other')) {
                    newSpecializations.push('Other');
                }
                 setFormState(prev => ({ ...prev, specialization: newSpecializations }));

            } else {
                // If no custom spec, but 'Other' is selected, it means it was just checked
                // without filling the text yet, so we don't need to do anything special.
                // If 'Other' is not selected, clear the text field.
                if (!userProfile.specialization?.includes('Other')) {
                    setOtherSpecialization('');
                }
            }
        }
    }, [userProfile]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSpecializationChange = (selected: string[]) => {
        setFormState(prev => ({ ...prev, specialization: selected }));
        // If 'Other' is deselected, clear the custom text
        if (!selected.includes('Other')) {
            setOtherSpecialization('');
        }
    }
    
    const clearSpecializations = () => {
        handleSpecializationChange([]);
    }

    const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!user || !userProfile) return;

        setIsLoading(true);

        // Start with the selected specializations, but remove the 'Other' placeholder
        let finalSpecializations = (formState.specialization || []).filter(s => s !== 'Other');

        // If 'Other' was selected and the text input has a value, add it
        if (formState.specialization?.includes('Other') && otherSpecialization.trim() !== '') {
            finalSpecializations.push(otherSpecialization.trim());
        }

        const updateData: Partial<UserProfile> = {
            ...formState,
            specialization: finalSpecializations,
            maxActiveContracts: Number(formState.maxActiveContracts) || 0,
            experience: Number(formState.experience) || 0,
        }

        try {
            const batch = writeBatch(firestore);

            const userRef = doc(firestore, 'users', user.uid);
            batch.update(userRef, updateData);

            if (userProfile.role === 'auditor') {
                const auditorRef = doc(firestore, 'auditors', user.uid);
                const auditorProfileData: Partial<AuditorProfile> = {
                    displayName: updateData.displayName,
                    firm: updateData.firm,
                    specialization: updateData.specialization,
                    experience: updateData.experience,
                    maxActiveContracts: updateData.maxActiveContracts,
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
                <Separator className="my-6" />
                <div className="space-y-1">
                    <h3 className="text-lg font-semibold">Auditor Settings</h3>
                    <p className="text-sm text-muted-foreground">Manage your public auditor profile and workload.</p>
                </div>
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
                    <div className="flex items-center gap-2">
                        <MultiSelect
                            options={specializationOptions}
                            selected={formState.specialization || []}
                            onChange={handleSpecializationChange}
                            placeholder="Select your areas of expertise..."
                            className="w-full"
                        />
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button type="button" variant="ghost" size="icon" onClick={clearSpecializations} disabled={(formState.specialization || []).length === 0}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Clear selection</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
                {formState.specialization?.includes('Other') && (
                    <div className="space-y-2 pl-1 pt-2">
                        <Label htmlFor="otherSpecialization">If other, please specify</Label>
                        <Input 
                            id="otherSpecialization" 
                            name="otherSpecialization" 
                            value={otherSpecialization} 
                            onChange={(e) => setOtherSpecialization(e.target.value)}
                            placeholder="e.g., Blockchain Law"
                        />
                    </div>
                )}
                 <div className="space-y-2">
                    <Label htmlFor="maxActiveContracts">Maximum Concurrent Reviews</Label>
                    <Input id="maxActiveContracts" name="maxActiveContracts" type="number" value={formState.maxActiveContracts || ''} onChange={handleInputChange} placeholder="e.g., 5" />
                    <p className="text-xs text-muted-foreground">Set a limit on how many contracts you review at one time.</p>
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
