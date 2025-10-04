'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  ChevronDown,
  CreditCard,
  LogOut,
  Settings,
  User as UserIcon,
} from 'lucide-react';
import type { UserProfile } from '@/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

type AppHeaderProps = {
  user: UserProfile;
};

export function AppHeader({ user }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  
  const pageTitle = pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard';
  const capitalizedTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>

      <div className="flex-1">
        <h1 className="hidden text-xl font-semibold md:block font-headline">
          {capitalizedTitle}
        </h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2 h-10 px-2"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback>
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left md:block">
              <div className="text-sm font-medium">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
            <ChevronDown className="hidden h-4 w-4 md:block" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <UserIcon />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
