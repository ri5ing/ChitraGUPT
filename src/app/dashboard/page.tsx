import { StatsCards } from '@/components/dashboard/stats-cards';
import { RecentContracts } from '@/components/dashboard/recent-contracts';
import { UploadContractDialog } from '@/components/dashboard/upload-contract-dialog';
import { ReviewRequests } from '@/components/dashboard/review-requests';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">Welcome back!</h2>
          <p className="text-muted-foreground">Here's a summary of your contract activity.</p>
        </div>
        <div className="flex items-center gap-2">
          <UploadContractDialog />
        </div>
      </div>

      <StatsCards />

      <ReviewRequests />
      
      <RecentContracts />
    </div>
  );
}
