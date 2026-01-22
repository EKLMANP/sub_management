import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, subscriptionDocuments } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const subscriptionId = searchParams.get('subscriptionId');

        if (!subscriptionId) {
            return NextResponse.json({ error: 'Missing subscriptionId' }, { status: 400 });
        }

        const documents = await db.query.subscriptionDocuments.findMany({
            where: eq(subscriptionDocuments.subscriptionId, subscriptionId),
            orderBy: (docs, { desc }) => [desc(docs.createdAt)],
        });

        return NextResponse.json(documents);
    } catch (error) {
        console.error('Fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { subscriptionId, file, fileName } = body;

        if (!subscriptionId || !file || !fileName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Basic validation for Base64 string
        if (!file.startsWith('data:')) {
            return NextResponse.json({ error: 'Invalid file format' }, { status: 400 });
        }

        // Calculate approximate size (Base64 length * 0.75)
        const sizeInBytes = file.length * 0.75;
        const maxSize = 2 * 1024 * 1024; // 2MB

        if (sizeInBytes > maxSize) {
            return NextResponse.json({ error: 'File too large (max 2MB)' }, { status: 400 });
        }

        const [document] = await db
            .insert(subscriptionDocuments)
            .values({
                subscriptionId,
                fileUrl: file, // Storing Base64 directly
                fileName,
                uploadedBy: userId,
            })
            .returning();

        return NextResponse.json(document);
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
    }
}
