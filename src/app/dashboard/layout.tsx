'use client';
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  SidebarProvider,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';
import { AppHeader } from '@/components/layout/header';
import { useDoc, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { UserProfile } from '@/types';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar user={userProfile} isLoading={isUserLoading || isProfileLoading} />
        <div className="flex flex-col flex-1">
          <AppHeader user={userProfile} isLoading={isUserLoading || isProfileLoading} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {isUserLoading || isProfileLoading ? (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight font-headline">Welcome back!</h2>
                    <p className="text-muted-foreground">Here's a summary of your contract activity.</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="h-28 bg-muted rounded-lg animate-pulse"></div>
                    <div className="h-28 bg-muted rounded-lg animate-pulse"></div>
                    <div className="h-28 bg-muted rounded-lg animate-pulse"></div>
                    <div className="h-28 bg-muted rounded-lg animate-pulse"></div>
                </div>
                <div className="h-96 bg-muted rounded-lg animate-pulse"></div>
              </div>
            ) : children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
