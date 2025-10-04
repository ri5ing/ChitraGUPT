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
} from 'lucide-react';
import { Logo } from '@/components/icons';
import type { UserProfile } from '@/types';
import { Badge } from '../ui/badge';

type AppSidebarProps = {
  user: UserProfile;
};

export function AppSidebar({ user }: AppSidebarProps) {
  const commonLinks = [
    { href: '/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
    { href: '#', icon: <FileText />, label: 'Contracts' },
  ];

  const roleLinks = {
    client: [],
    auditor: [
      { href: '#', icon: <ShieldCheck />, label: 'Review Queue' },
    ],
    admin: [
      { href: '/dashboard/admin', icon: <UserCog />, label: 'Admin Panel' },
    ],
  };

  const menuItems = [...commonLinks, ...roleLinks[user.role]];

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
        {menuItems.map((item) => (
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
         <div className="group-data-[collapsible=icon]:hidden p-2 space-y-2 bg-card rounded-lg border">
            <h4 className="font-semibold text-sm">Credits</h4>
            <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{user.creditBalance}</span>
                <Badge variant={user.creditBalance > 0 ? "secondary" : "destructive"}>{user.creditBalance > 0 ? "Active" : "Empty"}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">You have {user.creditBalance} credits remaining.</p>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <LifeBuoy />
              <span>Support</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
