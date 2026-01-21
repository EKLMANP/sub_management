import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db, approvalRequests, subscriptions } from '@/lib/db';
import { eq } from 'drizzle-orm';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { approved } = body;

    // Get the approval request
    const approval = await db.query.approvalRequests.findFirst({
        where: eq(approvalRequests.id, id),
    });

    if (!approval) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Update approval status
    await db
        .update(approvalRequests)
        .set({
            status: approved ? 'approved' : 'rejected',
            approverId: userId,
            resolvedAt: new Date(),
        })
        .where(eq(approvalRequests.id, id));

    // If approved, update subscription status
    if (approved && approval.subscriptionId) {
        const newStatus = approval.type === 'cancel' ? 'cancelled' : 'active';
        await db
            .update(subscriptions)
            .set({ status: newStatus })
            .where(eq(subscriptions.id, approval.subscriptionId));
    }

    return NextResponse.json({ success: true });
}
