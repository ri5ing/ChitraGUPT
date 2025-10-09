'use client';

import { UserProfileForm } from '@/components/dashboard/user-profile-form';

export default function ProfilePage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight font-headline">My Profile</h2>
                <p className="text-muted-foreground">View and update your personal and professional details.</p>
            </div>
            <UserProfileForm />
        </div>
    )
}
