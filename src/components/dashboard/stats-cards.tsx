'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, FileClock, ShieldCheck, FileText } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Contract, UserProfile } from '@/types';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';

export function StatsCards() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'users');
  }, [firestore, user]);

  const { data: userProfileData, isLoading: isProfileLoading } = useCollection<UserProfile>(
    userProfileRef && query(userProfileRef, where('id', '==', user?.uid))
  );

  const contractsRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/contracts`);
  }, [firestore, user]);

  const { data: contracts, isLoading: isContractsLoading } = useCollection<Contract>(contractsRef);

  const currentUserProfile = userProfileData?.[0];

  if (isUserLoading || isProfileLoading || isContractsLoading || !currentUserProfile || !contracts) {
    return <StatsCardsSkeleton />;
  }

  const stats = [
    {
      title: 'Credits Remaining',
      value: currentUserProfile.creditBalance.toString(),
      icon: <CreditCard className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: 'Contracts Analyzed',
      value: contracts.filter(c => c.aiAnalysis).length.toString(),
      icon: <FileText className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: 'Active Reviews',
      value: contracts.filter(c => c.status === 'In Review').length.toString(),
      icon: <FileClock className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: 'Completed',
      value: contracts.filter(c => c.status === 'Completed').length.toString(),
      icon: <ShieldCheck className="h-5 w-5 text-muted-foreground" />,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function StatsCardsSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
        </div>
    )
}