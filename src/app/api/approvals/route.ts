import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db, approvalRequests, subscriptions, profiles } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function GET() {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allApprovals = await db.query.approvalRequests.findMany({
        orderBy: (approvalRequests, { desc }) => [desc(approvalRequests.createdAt)],
    });

    // Get related data
    const allSubscriptions = await db.query.subscriptions.findMany();
    const allProfiles = await db.query.profiles.findMany();

    const approvalsWithRelations = allApprovals.map(approval => ({
        ...approval,
        subscription: allSubscriptions.find(s => s.id === approval.subscriptionId),
        requester: allProfiles.find(p => p.id === approval.requesterId),
    }));

    return NextResponse.json(approvalsWithRelations);
}
