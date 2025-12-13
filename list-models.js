require('dotenv').config({ path: './apps/api/.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const models = await genAI.listModels();
    console.log('\n✅ Available Gemini Models:\n');
    
    for (const model of models) {
      console.log('📦 Model:', model.name);
      console.log('   Display Name:', model.displayName);
      console.log('   Supported Methods:', model.supportedGenerationMethods?.join(', '));
      console.log('');
    }
  } catch (error) {
    console.error('❌ Error listing models:', error.message);
  }
}

listModels();
