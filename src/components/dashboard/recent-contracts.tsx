import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { mockContracts } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function RecentContracts() {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Completed":
        return "default";
      case "In Review":
        return "secondary";
      case "Action Required":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Contracts</CardTitle>
          <CardDescription>
            An overview of your most recent contract analyses.
          </CardDescription>
        </div>
        <Button variant="ghost" asChild>
            <Link href="#">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contract Title</TableHead>
              <TableHead className="hidden sm:table-cell">Client</TableHead>
              <TableHead className="hidden md:table-cell">Uploaded</TableHead>
              <TableHead className="text-right">Status</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockContracts.slice(0, 4).map((contract) => (
              <TableRow key={contract.id}>
                <TableCell>
                  <div className="font-medium">{contract.title}</div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{contract.clientName}</TableCell>
                <TableCell className="hidden md:table-cell">{contract.uploadDate}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={getStatusVariant(contract.status)} className="capitalize">
                    {contract.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/contracts/${contract.id}`}>View</Link>
                    </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
