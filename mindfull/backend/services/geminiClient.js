// backend/services/geminiClient.js
const path = require('path');
// Always load the root .env no matter where we run from:
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

async function createClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY;
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY (or GEMINI_KEY) in .env');

  // Use dynamic import so this stays CommonJS
  const { GoogleGenAI } = await import('@google/genai');
  return new GoogleGenAI({ apiKey });
}

async function askGemini(prompt) {
  const ai = await createClient();
  const resp = await ai.models.generateContent({
    model: 'gemini-2.0-flash-001',
    contents: [{ role: 'user', parts: [{ text: prompt }]}]
  });

  // Safely pull out text
  return (
    resp?.text ??
    resp?.output_text ??
    resp?.candidates?.[0]?.content?.parts?.[0]?.text ??
    '(no text in response)'
  );
}

module.exports = { askGemini };

// ---- Self-test so `node backend/services/geminiClient.js "prompt"` works
if (require.main === module) {
  (async () => {
    try {
      const prompt = process.argv.slice(2).join(' ') || 'Write a short haiku about JavaScript.';
      console.log('Sending prompt to Gemini...');
      const out = await askGemini(prompt);
      console.log('\nGemini response:\n');
      console.log(out);
    } catch (err) {
      console.error('Gemini error:', err?.status ?? '', err?.message ?? err);
      process.exit(1);
    }
  })();
}