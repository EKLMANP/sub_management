import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db, profiles } from '@/lib/db';

export async function GET() {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allProfiles = await db.query.profiles.findMany({
        orderBy: (profiles, { desc }) => [desc(profiles.createdAt)],
    });

    return NextResponse.json(allProfiles);
}
