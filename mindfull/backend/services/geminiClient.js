const axios = require('axios');
const path = require('path');

// Load environment variables from root .env
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('Warning: GEMINI_API_KEY not found in environment variables');
}

async function askGemini(prompt) {
  if (!API_KEY) {
    throw new Error('GEMINI_API_KEY is required. Please set it in your .env file or environment.');
  }
  
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;
    const response = await axios.post(
      url,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    // Log as much useful info as possible without leaking secrets
    console.error('Gemini API error:', error.response?.status, error.response?.data || error.message);
    throw error;
  }
}

module.exports = { askGemini };
