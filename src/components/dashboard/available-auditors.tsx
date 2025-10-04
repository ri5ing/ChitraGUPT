'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, doc, updateDoc } from 'firebase/firestore';
import type { AuditorProfile, Contract } from '@/types';
import { Loader2, MessageSquareQuote, Send, Star } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle } from 'lucide-react';

type AvailableAuditorsProps = {
  contract: Contract;
};

export function AvailableAuditors({ contract }: AvailableAuditorsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAuditorId, setSelectedAuditorId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const auditorsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'auditors'));
  }, [firestore]);

  const { data: auditors, isLoading: isLoadingAuditors, error } = useCollection<AuditorProfile>(auditorsQuery);

  const handleSendRequest = async (auditor: AuditorProfile) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You are not logged in.' });
      return;
    }
    setSelectedAuditorId(auditor.id);
    setIsLoading(true);
    
    try {
      const contractRef = doc(firestore, 'users', user.uid, 'contracts', contract.id);
      await updateDoc(contractRef, {
        status: 'In Review',
        auditorId: auditor.id
      });

      toast({
        title: 'Request Sent',
        description: `Your request has been sent to ${auditor.displayName}.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to send request',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
      setSelectedAuditorId(null);
    }
  };

  const renderContent = () => {
    if (isLoadingAuditors) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
                <CardHeader className="flex flex-row items-center gap-4 pb-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Could not load the list of auditors. Please try again later.
          </AlertDescription>
        </Alert>
      );
    }

    if (auditors && auditors.length > 0) {
      return auditors.map((auditor) => (
        <Card key={auditor.id} className="w-full text-left">
            <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12 border">
                        <AvatarImage src={auditor.avatarUrl} alt={auditor.displayName} />
                        <AvatarFallback>{auditor.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="font-semibold">{auditor.displayName}</p>
                        <p className="text-sm text-muted-foreground">{auditor.firm || 'Independent'}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                 {auditor.specialization && (
                    <div className="flex flex-wrap gap-1">
                    {(Array.isArray(auditor.specialization) ? auditor.specialization : [auditor.specialization]).map((spec: string) => (
                        <Badge key={spec} variant="secondary" className="text-xs">{spec}</Badge>
                    ))}
                    </div>
                )}
                 <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    <span>{auditor.experience || 'New'} years of experience</span>
                </div>
                 <Button 
                    onClick={() => handleSendRequest(auditor)} 
                    disabled={isLoading && selectedAuditorId === auditor.id}
                    className="w-full"
                    size="sm"
                >
                    {isLoading && selectedAuditorId === auditor.id 
                        ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                        : <MessageSquareQuote className="mr-2 h-4 w-4" />
                    }
                    Request Review
                </Button>
            </CardContent>
        </Card>
      ));
    }

    return <p className="text-center text-muted-foreground py-10">No auditors found.</p>;
  }

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle>Available Auditors</CardTitle>
        <CardDescription>
          Choose an expert to review your contract.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 pr-4 -mr-4">
            <div className="space-y-4">
              {renderContent()}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
