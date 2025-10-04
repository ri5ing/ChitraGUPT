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
  Languages,
  LogOut,
  PlusCircle,
  Settings,
  User as UserIcon,
} from 'lucide-react';
import type { UserProfile } from '@/types';
import { usePathname } from 'next/navigation';
import { useAuth, useFirestore } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc, runTransaction } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { useAtom } from 'jotai';
import { languageAtom } from '@/lib/language-atom';

type AppHeaderProps = {
  user: UserProfile | null;
  isLoading: boolean;
};

export function AppHeader({ user, isLoading }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [language, setLanguage] = useAtom(languageAtom);
  
  const pageTitle = pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard';
  const capitalizedTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  }

  const handleAddCredits = async () => {
    if (!user) return;
    const userRef = doc(firestore, 'users', user.id);
    try {
      await runTransaction(firestore, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw new Error("User not found");
        }
        const newBalance = (userDoc.data().creditBalance || 0) + 10;
        transaction.update(userRef, { creditBalance: newBalance });
      });
      toast({
        title: 'Credits Added',
        description: '10 credits have been added to your account.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Adding Credits',
        description: error.message,
      });
    }
  };

  const getInitials = () => {
    if (user?.displayName) {
      return user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('');
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return '??';
  };
  
  const toggleLanguage = () => {
    const newLang = language === 'English' ? 'Hindi' : 'English';
    setLanguage(newLang);
    toast({
      title: 'Language Changed',
      description: `The application language is now set to ${newLang}.`,
    });
  };

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
      
      <Button variant="ghost" size="sm" onClick={toggleLanguage}>
        <Languages className="mr-2 h-4 w-4" />
        {language === 'English' ? 'हिंदी में बदलें' : 'Switch to English'}
      </Button>

      {isLoading ? <Skeleton className="h-10 w-48" /> : user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 h-10 px-2"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatarUrl} alt={user.displayName || ''} />
                <AvatarFallback>
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left md:block">
                <div className="text-sm font-medium">{user.displayName || user.email}</div>
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
            <DropdownMenuItem onClick={handleAddCredits}>
              <PlusCircle />
              Add Credits
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
      )}
    </header>
  );
}
