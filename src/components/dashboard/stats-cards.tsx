import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, FileClock, ShieldCheck, FileText } from 'lucide-react';
import { mockUsers, mockContracts } from '@/lib/mock-data';

export function StatsCards() {
  const user = mockUsers[0]; // Assuming client user
  const stats = [
    {
      title: 'Credits Remaining',
      value: user.credits.toString(),
      icon: <CreditCard className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: 'Contracts Analyzed',
      value: mockContracts.filter(c => c.aiAnalysis).length.toString(),
      icon: <FileText className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: 'Active Reviews',
      value: mockContracts.filter(c => c.status === 'In Review').length.toString(),
      icon: <FileClock className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: 'Completed',
      value: mockContracts.filter(c => c.status === 'Completed').length.toString(),
      icon: <ShieldCheck className="h-5 w-5 text-muted-foreground" />,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
