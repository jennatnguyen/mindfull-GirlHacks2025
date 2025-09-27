const axios = require('axios');

async function askGemini(prompt) {
  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta2/models/gemini-1.5-flash:generateText',
      { prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.GEMINI_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.output;
  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { askGemini };
