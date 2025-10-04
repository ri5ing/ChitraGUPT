import { LoginForm } from '@/components/auth/login-form';
import { Logo } from '@/components/icons';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <Logo className="h-10 w-10 text-primary" />
            <span className="text-2xl font-bold font-headline">ChitraGupt</span>
          </Link>
          <p className="text-muted-foreground">Welcome back. Please sign in to continue.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
