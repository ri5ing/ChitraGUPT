import Link from 'next/link';
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  FileText,
  LayoutDashboard,
  LifeBuoy,
  Settings,
  ShieldCheck,
  UserCog,
  Bot,
  Users,
  User,
} from 'lucide-react';
import { Logo } from '@/components/icons';
import type { UserProfile } from '@/types';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { ChatDialog } from '../chitragupt-guide/chat-dialog';

type AppSidebarProps = {
  user: UserProfile | null;
  isLoading: boolean;
};

export function AppSidebar({ user, isLoading }: AppSidebarProps) {
  const commonLinks = [
    { href: '/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
    { href: '/dashboard/contracts', icon: <FileText />, label: 'Contracts' },
    { href: '/dashboard/auditors', icon: <Users />, label: 'Find Auditors' },
  ];

  const roleLinks = {
    client: [],
    auditor: [
      { href: '/dashboard/review-queue', icon: <ShieldCheck />, label: 'Review Queue' },
    ],
    admin: [
      { href: '/dashboard/admin', icon: <UserCog />, label: 'Admin Panel' },
    ],
  };

  const menuItems = user ? [...commonLinks, ...roleLinks[user.role]] : commonLinks;

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 p-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold font-headline group-data-[collapsible=icon]:hidden">
            ChitraGupt
          </span>
        </div>
      </SidebarHeader>

      <SidebarMenu className="flex-1 p-2">
        {isLoading ? (
          <div className='space-y-2'>
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : menuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton asChild>
              <Link href={item.href}>
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>

      <SidebarFooter className="border-t p-2">
        <ChatDialog>
            <SidebarMenuButton variant="outline" className='justify-start w-full'>
                <Bot />
                <span className="font-semibold">ChitraGUPT</span>
            </SidebarMenuButton>
        </ChatDialog>

        {isLoading ? <Skeleton className="h-24 w-full" /> : user && (
          <div className="group-data-[collapsible=icon]:hidden p-2 space-y-2 bg-card rounded-lg border">
            <h4 className="font-semibold text-sm">Credits</h4>
            <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{user.creditBalance}</span>
                <Badge variant={user.creditBalance > 0 ? "secondary" : "destructive"}>{user.creditBalance > 0 ? "Active" : "Empty"}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">You have {user.creditBalance} credits remaining.</p>
          </div>
        )}
        <SidebarMenu>
           <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard/profile">
                <User />
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton>
              <LifeBuoy />
              <span>Support</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
