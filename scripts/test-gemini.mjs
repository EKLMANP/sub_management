
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from current directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('❌ Error: GEMINI_API_KEY is not set in .env');
    process.exit(1);
}

console.log(`🔑 Using API Key: ${apiKey.substring(0, 5)}...`);

const genAI = new GoogleGenerativeAI(apiKey);

const modelsToTest = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-001',
    'gemini-1.5-flash-002',
    'gemini-1.5-pro',
    'gemini-pro'
];

async function testModels() {
    console.log('\n🧪 Testing models...\n');

    for (const modelName of modelsToTest) {
        try {
            process.stdout.write(`Testing [${modelName}] ... `);
            const model = genAI.getGenerativeModel({ model: modelName });

            // Try a simple generation
            const result = await model.generateContent('Hi');
            const response = await result.response;
            const text = response.text();

            console.log(`✅ OK! Response: "${text.trim().substring(0, 20)}..."`);

            // If we found a working one and it's flash, we recommend it
            if (modelName.includes('flash')) {
                console.log(`\n✨ RECOMMENDED FIX: Change model to '${modelName}'`);
            }
        } catch (error) {
            console.log(`❌ Failed`);
            console.log(`   Error: ${error.message.split('\n')[0]}`);
        }
    }
}

testModels();
