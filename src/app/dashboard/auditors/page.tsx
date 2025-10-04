'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { AuditorProfile } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, MessageSquareQuote, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function AuditorsPage() {
  const firestore = useFirestore();

  const auditorsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'auditors'));
  }, [firestore]);

  const { data: auditors, isLoading, error } = useCollection<AuditorProfile>(auditorsQuery);

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">Find an Auditor</h2>
        <p className="text-muted-foreground">Browse our network of verified legal professionals.</p>
      </div>

      {isLoading && renderSkeleton()}

      {error && (
         <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Could not load the list of auditors. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && auditors && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auditors.map((auditor) => (
            <Card key={auditor.id} className="flex flex-col">
              <CardHeader className="flex-row items-start gap-4">
                <Avatar className="w-16 h-16 border-2 border-primary">
                  <AvatarImage src={auditor.avatarUrl} alt={auditor.displayName} />
                  <AvatarFallback>{auditor.displayName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle>{auditor.displayName}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Briefcase className="h-4 w-4" /> {auditor.firm || 'Independent'}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span>{auditor.experience || 'New'} years of experience</span>
                </div>
                 {auditor.specialization && auditor.specialization.length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold mb-2">Specializations</h4>
                        <div className="flex flex-wrap gap-2">
                        {(Array.isArray(auditor.specialization) ? auditor.specialization : [auditor.specialization]).map((spec: string) => (
                            <Badge key={spec} variant="secondary">{spec}</Badge>
                        ))}
                        </div>
                    </div>
                )}
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  <MessageSquareQuote className="mr-2 h-4 w-4" />
                  Request Review
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
       {!isLoading && !error && (!auditors || auditors.length === 0) && (
         <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
            <p>No auditors are currently available on the platform.</p>
         </div>
       )}
    </div>
  );
}
