import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { RecentContracts } from '@/components/dashboard/recent-contracts';
import { Upload } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">Welcome back!</h2>
          <p className="text-muted-foreground">Here's a summary of your contract activity.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
            {/* In a real app, this would open an upload modal. Here it links to a sample contract. */}
            <Link href="/dashboard/contracts/contract-002">
              <Upload className="mr-2 h-4 w-4" />
              Upload Contract
            </Link>
          </Button>
        </div>
      </div>

      <StatsCards />

      <RecentContracts />
    </div>
  );
}
