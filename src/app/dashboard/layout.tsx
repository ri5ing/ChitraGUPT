import type { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';
import { AppHeader } from '@/components/layout/header';
import { mockUsers } from '@/lib/mock-data';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  // Mocking the logged-in user. In a real app, this would come from an auth context.
  const user = mockUsers[0]; 

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar user={user} />
        <SidebarInset className="flex flex-col">
          <AppHeader user={user} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
