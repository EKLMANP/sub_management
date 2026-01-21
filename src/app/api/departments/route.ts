import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db, departments } from '@/lib/db';

export async function GET() {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allDepartments = await db.query.departments.findMany({
        orderBy: (departments, { asc }) => [asc(departments.name)],
    });

    return NextResponse.json(allDepartments);
}

export async function POST(request: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const [newDepartment] = await db
        .insert(departments)
        .values({ name })
        .returning();

    return NextResponse.json(newDepartment);
}
