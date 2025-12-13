require('dotenv').config({ path: './apps/api/.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testModels() {
  const modelsToTry = [
    'gemini-pro',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'models/gemini-pro',
    'models/gemini-1.5-pro',
    'models/gemini-1.5-flash',
  ];

  console.log('\n🔍 Testing available models...\n');

  for (const modelName of modelsToTry) {
    try {
      console.log(`Testing: ${modelName}`);
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      });
      
      const result = await model.generateContent('Respond with JSON: {"status": "ok"}');
      const response = result.response.text();
      console.log(`  ✅ WORKS! Response: ${response.substring(0, 50)}...\n`);
      break; // Found a working model
    } catch (error) {
      console.log(`  ❌ Failed: ${error.message.substring(0, 100)}\n`);
    }
  }
}

testModels();
