import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db, subscriptions, approvalRequests } from '@/lib/db';

export async function GET() {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allSubscriptions = await db.query.subscriptions.findMany({
        orderBy: (subscriptions, { desc }) => [desc(subscriptions.createdAt)],
    });

    return NextResponse.json(allSubscriptions);
}

export async function POST(request: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const [newSubscription] = await db
        .insert(subscriptions)
        .values({
            name: body.name,
            vendorName: body.vendor_name || null,
            vendorContact: body.vendor_contact || null,
            fee: body.fee.toString(),
            currency: body.currency || 'TWD',
            billingCycle: body.billing_cycle,
            startDate: body.start_date,
            endDate: body.end_date || null,
            nextRenewalDate: body.next_renewal_date || null,
            paymentMethod: body.payment_method || null,
            invoiceRequired: body.invoice_required || false,
            costCenter: body.cost_center || null,
            budgetCategory: body.budget_category || null,
            departmentId: body.department_id || null,
            ownerId: userId,
            status: 'pending_approval',
        })
        .returning();

    // Create approval request
    await db.insert(approvalRequests).values({
        subscriptionId: newSubscription.id,
        type: 'create',
        requesterId: userId,
    });

    return NextResponse.json(newSubscription);
}
