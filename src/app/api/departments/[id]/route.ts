import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db, departments } from '@/lib/db';
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

    if (!body.name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    await db
        .update(departments)
        .set({ name: body.name })
        .where(eq(departments.id, id));

    return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, { params }: RouteParams) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await db.delete(departments).where(eq(departments.id, id));

    return NextResponse.json({ success: true });
}
