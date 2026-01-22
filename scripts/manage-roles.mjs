// Script to query and update user roles
// Run with: node scripts/manage-roles.mjs

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const sql = neon(process.env.DATABASE_URL);

async function main() {
    const action = process.argv[2];

    if (action === 'list') {
        // List all users
        const users = await sql`SELECT id, email, display_name, role FROM profiles ORDER BY created_at DESC`;
        console.log('\n📋 Current Users:\n');
        console.table(users);
    } else if (action === 'set-admin') {
        const email = process.argv[3];
        if (!email) {
            console.error('❌ Please provide an email: node scripts/manage-roles.mjs set-admin your@email.com');
            process.exit(1);
        }
        const result = await sql`UPDATE profiles SET role = 'admin' WHERE email = ${email} RETURNING email, role`;
        if (result.length > 0) {
            console.log(`✅ Successfully set ${result[0].email} as admin!`);
        } else {
            console.log(`❌ No user found with email: ${email}`);
            console.log('💡 Tip: The user needs to log in at least once to create a profile.');
        }
    } else if (action === 'set-role') {
        const email = process.argv[3];
        const role = process.argv[4];
        if (!email || !role) {
            console.error('❌ Usage: node scripts/manage-roles.mjs set-role your@email.com [member|manager|admin]');
            process.exit(1);
        }
        if (!['member', 'manager', 'admin'].includes(role)) {
            console.error('❌ Role must be one of: member, manager, admin');
            process.exit(1);
        }
        const result = await sql`UPDATE profiles SET role = ${role} WHERE email = ${email} RETURNING email, role`;
        if (result.length > 0) {
            console.log(`✅ Successfully set ${result[0].email} as ${result[0].role}!`);
        } else {
            console.log(`❌ No user found with email: ${email}`);
        }
    } else {
        console.log(`
🔧 User Role Management Script

Usage:
  node scripts/manage-roles.mjs list                           - List all users
  node scripts/manage-roles.mjs set-admin your@email.com       - Set user as admin
  node scripts/manage-roles.mjs set-role your@email.com admin  - Set specific role
        `);
    }
}

main().catch(console.error);
