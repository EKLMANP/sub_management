import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, subscriptions } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const subscription = await db.query.subscriptions.findFirst({
            where: eq(subscriptions.id, id),
        });

        if (!subscription) {
            return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
        }

        return NextResponse.json(subscription);
    } catch (error) {
        console.error('Error fetching subscription:', error);
        return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        // Map snake_case from frontend to camelCase for database
        const updateData: Record<string, any> = {};

        if (body.name !== undefined) updateData.name = body.name;
        if (body.vendor_name !== undefined) updateData.vendorName = body.vendor_name;
        if (body.vendor_contact !== undefined) updateData.vendorContact = body.vendor_contact;
        if (body.fee !== undefined) updateData.fee = body.fee.toString();
        if (body.renewal_fee !== undefined) updateData.renewalFee = body.renewal_fee?.toString() || null;
        if (body.currency !== undefined) updateData.currency = body.currency;
        if (body.billing_cycle !== undefined) updateData.billingCycle = body.billing_cycle;
        if (body.status !== undefined) updateData.status = body.status;
        if (body.start_date !== undefined) updateData.startDate = body.start_date || null;
        if (body.end_date !== undefined) updateData.endDate = body.end_date || null;
        if (body.next_renewal_date !== undefined) updateData.nextRenewalDate = body.next_renewal_date || null;
        if (body.payment_method !== undefined) updateData.paymentMethod = body.payment_method;
        if (body.invoice_required !== undefined) updateData.invoiceRequired = body.invoice_required;
        if (body.cost_center !== undefined) updateData.costCenter = body.cost_center;
        if (body.budget_category !== undefined) updateData.budgetCategory = body.budget_category;
        if (body.department_id !== undefined) updateData.departmentId = body.department_id || null;

        updateData.updatedAt = new Date();

        const updated = await db
            .update(subscriptions)
            .set(updateData)
            .where(eq(subscriptions.id, id))
            .returning();

        if (updated.length === 0) {
            return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
        }

        return NextResponse.json(updated[0]);
    } catch (error) {
        console.error('Error updating subscription:', error);
        return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
    }
}
