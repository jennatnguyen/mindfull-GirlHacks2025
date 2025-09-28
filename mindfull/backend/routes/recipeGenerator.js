const { askGemini } = require('../services/geminiClient');

// Development mock recipes for when Gemini API is not available
const mockRecipes = [
  {
    "id": "mock_recipe_1",
    "title": "Quick Protein Scramble",
    "servings": 2,
    "prep_time_minutes": 5,
    "cook_time_minutes": 10,
    "total_time_minutes": 15,
    "difficulty": "easy",
    "ingredients": [
      {
        "name": "eggs",
        "amount": { "value": 3, "unit": "pieces" },
        "notes": "preferably free-range"
      },
      {
        "name": "cheese",
        "amount": { "value": 50, "unit": "g" },
        "notes": "any type"
      },
      {
        "name": "spinach",
        "amount": { "value": 1, "unit": "cup" },
        "notes": "fresh or frozen"
      }
    ],
    "steps": [
      "Heat a non-stick pan over medium heat",
      "Add spinach and cook until wilted",
      "Beat eggs and pour into pan",
      "Scramble eggs gently, adding cheese near the end",
      "Season with salt and pepper, serve hot"
    ],
    "nutrition_per_serving": {
      "calories_kcal": 220,
      "macros_g": { "protein_g": 18, "carbs_g": 3, "fat_g": 15 },
      "micros": { "fiber_g": 1, "sugar_g": 2, "sodium_mg": 350 }
    },
    "tags": ["high-protein", "low-carb", "quick", "vegetarian"],
    "source": { "name": "Mock Recipe for Development" },
    "confidence": 0.9
  }
];

// Generate recipes using Gemini API
async function generateRecipes(userRequest) {
  try {
    console.log('Generating recipes for request:', userRequest);
    
    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.log('GEMINI_API_KEY not found, returning mock recipes for development');
      // Return mock recipe(s) modified to match the request context
      return mockRecipes.map(recipe => ({
        ...recipe,
        title: `${recipe.title} (for: ${userRequest.substring(0, 30)}${userRequest.length > 30 ? '...' : ''})`
      }));
    }

    const prompt = `You are a professional chef and nutritionist. A user has requested: "${userRequest}"

Please provide exactly 5 detailed recipe recommendations that match this request. For each recipe, provide the information in this exact JSON format:

[
  {
    "id": "recipe_1",
    "title": "Recipe Name",
    "servings": number,
    "prep_time_minutes": number,
    "cook_time_minutes": number,
    "total_time_minutes": number,
    "difficulty": "easy|medium|hard",
    "ingredients": [
      {
        "name": "ingredient name",
        "amount": {
          "value": number,
          "unit": "unit (e.g., g, cups, pieces)"
        },
        "notes": "optional preparation notes"
      }
    ],
    "steps": ["Step-by-step cooking instructions"],
    "nutrition_per_serving": {
      "calories_kcal": number,
      "macros_g": {
        "protein_g": number,
        "carbs_g": number,
        "fat_g": number
      },
      "micros": {
        "fiber_g": number,
        "sugar_g": number,
        "sodium_mg": number
      }
    },
    "tags": ["relevant tags like high-protein, low-fat, etc"],
    "source": {
      "name": "Traditional/Chef's Special/etc"
    },
    "confidence": number between 0.7-1.0
  }
]

Make sure each recipe:
1. Directly addresses the user's specific requirements
2. Has realistic cooking times and nutritional information
3. Uses commonly available ingredients
4. Provides clear, actionable steps
5. Includes appropriate tags for the dietary requirements

Return ONLY the JSON array, no additional text or formatting.`;

    const response = await askGemini(prompt);
    
    // Parse the JSON response from Gemini
    try {
      // Remove any markdown formatting if present
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      const recipes = JSON.parse(cleanResponse);
      
      // Validate that we got an array with 5 recipes
      if (!Array.isArray(recipes) || recipes.length === 0) {
        throw new Error('Invalid response format from AI');
      }
      
      // Ensure each recipe has required fields
      return recipes.map((recipe, index) => ({
        id: recipe.id || `recipe_${index + 1}`,
        title: recipe.title || `Recipe ${index + 1}`,
        servings: recipe.servings || 2,
        prep_time_minutes: recipe.prep_time_minutes || 15,
        cook_time_minutes: recipe.cook_time_minutes || 20,
        total_time_minutes: recipe.total_time_minutes || 35,
        difficulty: recipe.difficulty || 'medium',
        ingredients: recipe.ingredients || [],
        steps: recipe.steps || [],
        nutrition_per_serving: recipe.nutrition_per_serving || {
          calories_kcal: 300,
          macros_g: { protein_g: 20, carbs_g: 15, fat_g: 10 },
          micros: { fiber_g: 3, sugar_g: 5, sodium_mg: 400 }
        },
        tags: recipe.tags || [],
        source: recipe.source || { name: "AI Generated" },
        confidence: recipe.confidence || 0.8
      }));
      
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      console.error('Raw response:', response);
      
      // Fallback: return a structured error response
      return [{
        id: 'error_fallback',
        title: 'Recipe Generation Error',
        servings: 2,
        prep_time_minutes: 0,
        cook_time_minutes: 0,
        total_time_minutes: 0,
        difficulty: 'easy',
        ingredients: [],
        steps: ['Sorry, we encountered an error generating recipes. Please try again with a different request.'],
        nutrition_per_serving: {
          calories_kcal: 0,
          macros_g: { protein_g: 0, carbs_g: 0, fat_g: 0 },
          micros: { fiber_g: 0, sugar_g: 0, sodium_mg: 0 }
        },
        tags: ['error'],
        source: { name: 'System' },
        confidence: 0.0
      }];
    }
    
  } catch (error) {
    console.error('Error generating recipes:', error);
    throw new Error('Failed to generate recipes. Please try again later.');
  }
}

module.exports = { generateRecipes };