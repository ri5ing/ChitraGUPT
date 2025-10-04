import { AdminDashboard } from "@/components/dashboard/admin-dashboard";

export default function AdminPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight font-headline">Admin Panel</h2>
                <p className="text-muted-foreground">Manage users, monitor activity, and view analytics.</p>
            </div>
            <AdminDashboard />
        </div>
    )
}