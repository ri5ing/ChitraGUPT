import { notFound } from 'next/navigation';
import { mockContracts } from '@/lib/mock-data';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare, ShieldAlert } from 'lucide-react';
import { ContractAnalysis } from '@/components/dashboard/contract-analysis';

export default function ContractDetailPage({ params }: { params: { id: string } }) {
  const contract = mockContracts.find((c) => c.id === params.id);

  if (!contract) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
            <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Link>
        </Button>
        <div className="flex items-center gap-2">
            <Button variant="secondary">
                <MessageSquare className="mr-2 h-4 w-4" />
                Request Auditor Review
            </Button>
            <Button variant="destructive">
                <ShieldAlert className="mr-2 h-4 w-4" />
                Flag for Renegotiation
            </Button>
        </div>
      </div>
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">{contract.title}</h1>
        <p className="text-muted-foreground">
          Client: {contract.clientName} | Uploaded: {contract.uploadDate}
        </p>
      </div>

      <ContractAnalysis contract={contract} />
    </div>
  );
}
