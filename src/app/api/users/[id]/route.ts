import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db, profiles } from '@/lib/db';
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

    await db
        .update(profiles)
        .set({
            role: body.role,
            departmentId: body.departmentId || null,
        })
        .where(eq(profiles.id, id));

    return NextResponse.json({ success: true });
}
