
import dotenv from 'dotenv';
import path from 'path';

// Load .env from current directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('❌ Error: GEMINI_API_KEY is not set in .env');
    process.exit(1);
}

console.log(`🔑 Testing API Key: ${apiKey.substring(0, 5)}...`);

async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        console.log(`\n📡 Fetching models from: ${url}`);
        const response = await fetch(url);

        if (!response.ok) {
            console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error(`   Response: ${text}`);
            return;
        }

        const data = await response.json();
        if (data.models) {
            console.log(`\n✅ Found ${data.models.length} models:`);
            data.models.forEach(m => {
                const name = m.name.split('/').pop();
                if (name.includes('gemini')) {
                    console.log(`   - ${name}`);
                }
            });
            console.log('\n✨ Recommended model to use:', data.models.find(m => m.name.includes('flash'))?.name.split('/').pop() || 'None');
        } else {
            console.log('⚠️ No models found in response.');
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('❌ Fetch failed:', error.message);
    }
}

listModels();
