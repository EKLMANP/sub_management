
import dotenv from 'dotenv';
import path from 'path';

// Load env from root FIRST
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const newDepartments = ['Eric個人', 'Pennee個人', 'Dori & Rito'];

async function seed() {
    console.log('Connecting to database...');
    // Import db after env is loaded
    const { db } = await import('../src/lib/db');
    const { departments } = await import('../src/lib/db/schema');

    for (const name of newDepartments) {
        try {
            await db.insert(departments).values({ name }).onConflictDoNothing();
            console.log(`Processed: ${name}`);
        } catch (e) {
            console.error(`Error processing ${name}:`, e);
        }
    }

    console.log('Done.');
    process.exit(0);
}

seed().catch((e) => {
    console.error(e);
    process.exit(1);
});
