'use client';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  SidebarProvider,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';
import { AppHeader } from '@/components/layout/header';
import { useDoc, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { UserProfile } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  if (isUserLoading || isProfileLoading) {
    return <DashboardSkeleton />;
  }

  if (!user || !userProfile) {
    router.push('/login');
    return <DashboardSkeleton />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar user={userProfile} />
        <div className="flex flex-col flex-1">
          <AppHeader user={userProfile} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen">
      <div className="w-64 border-r p-4">
        <Skeleton className="h-10 w-32 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
      <div className="flex-1">
        <header className="h-16 border-b flex items-center justify-end px-6">
          <Skeleton className="h-10 w-48" />
        </header>
        <main className="p-8 space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
          <Skeleton className="h-96" />
        </main>
      </div>
    </div>
  )
}
