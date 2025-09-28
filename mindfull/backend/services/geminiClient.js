// geminiClient.js
// require('dotenv/config');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });


async function createClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in your .env file");
  }

  // Import @google/genai dynamically (so we can stay CommonJS)
  const { GoogleGenAI } = await import('@google/genai');
  return new GoogleGenAI({ apiKey });
}

async function askGemini(prompt) {
  const ai = await createClient();
  const model = 'gemini-2.0-flash-001'; // recommended current model

  const resp = await ai.models.generateContent({
    model,
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ]
  });

  return (
    resp?.text ??
    resp?.output_text ??
    resp?.candidates?.[0]?.content?.parts?.[0]?.text ??
    '(no text in response)'
  );
}

module.exports = { askGemini };

// --- Self-test: run with `node geminiClient.js "your prompt"` ---
if (require.main === module) {
  (async () => {
    try {
      const prompt =
        process.argv.slice(2).join(' ') || 'Write a short haiku about JavaScript.';
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