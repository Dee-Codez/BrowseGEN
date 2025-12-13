require('dotenv').config({ path: './apps/api/.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testModels() {
  const modelsToTry = [
    'gemini-pro',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
  ];

  console.log('\n🔍 Testing available models (without JSON mode)...\n');

  for (const modelName of modelsToTry) {
    try {
      console.log(`Testing: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent('Say "hello" in one word.');
      const response = result.response.text();
      console.log(`  ✅ WORKS! Response: ${response}\n`);
    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}\n`);
    }
  }
}

testModels();
