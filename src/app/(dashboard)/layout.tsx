import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { db, profiles } from '@/lib/db';
import { eq } from 'drizzle-orm';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId } = await auth();

    if (!userId) {
        redirect('/login');
    }

    const user = await currentUser();

    // Get or create user profile
    let profile = await db.query.profiles.findFirst({
        where: eq(profiles.id, userId),
    });

    // Create profile if doesn't exist
    if (!profile && user) {
        const [newProfile] = await db
            .insert(profiles)
            .values({
                id: userId,
                email: user.emailAddresses[0]?.emailAddress || '',
                displayName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : null,
                role: 'member',
            })
            .returning();
        profile = newProfile;
    }

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Background effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl" />
            </div>

            <Sidebar
                userRole={profile?.role || 'member'}
                userName={profile?.displayName || user?.emailAddresses[0]?.emailAddress || 'User'}
            />

            <main className="lg:ml-72 relative">
                {children}
            </main>
        </div>
    );
}
