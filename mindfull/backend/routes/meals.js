const express = require('express');
const router = express.Router();
const supabase = require('../services/supabaseClient');
const { generateRecipes } = require('./recipeGenerator');
const path = require('path');
// Always load the root .env (mindfull/.env), regardless of where we run from
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
// Uses the helper you already tested in backend/services/geminiClient.js
const { askGemini } = require('../services/geminiClient');

// ------------------------ RECIPES CRUD ------------------------------

// Create a new recipe with Gemini-generated instructions and user_id
router.post('/', async (req, res) => {
  const { name, user_id } = req.body;
  if (!name || !user_id) {
    return res.status(400).json({ error: 'Name and user_id are required' });
  }

  try {
    // Ask Gemini for concise, numbered steps. Save the results into the table.
    const prompt = `Write concise, numbered cooking instructions for a recipe titled "${name}". Keep it short (3-10 steps).`;
    let instructions = await askGemini(prompt);

    // Ask Gemini to categorize the recipe
    const typePrompt = `Given the recipe title "${name}", categorize it as one of the following types: meat, sweet, vegetarian, vegan, seafood, fruit, egg, or grain. Respond with only the type.`;
    let type = '';
    try {
      type = (await askGemini(typePrompt)).toString().trim().toLowerCase();
      // Validate type
      const allowedTypes = ['meat', 'sweet', 'vegetarian', 'vegan', 'seafood', 'fruit', 'egg', 'grain'];
      if (!allowedTypes.includes(type)) {
        type = 'uncategorized';
      }
    } catch (catErr) {
      console.error('Gemini error categorizing recipe:', catErr);
      type = 'uncategorized';
    }

    const { data, error } = await supabase
      .from('recipes')
      .insert([{ name, instructions, user_id, type }])
      .select();
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to create recipe' });
    }
    res.status(201).json({ recipe: data[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all recipes for a specific user
router.get('/user/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_id', user_id);
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch recipes' });
    }
    res.json({ recipes: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a single recipe by id
router.get('/single/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      console.error('Supabase error:', error);
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json({ recipe: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a recipe
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('recipes').delete().eq('id', id);
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to delete recipe' });
    }
    res.json({ message: 'Recipe deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------------------- GROCERY LIST ---------------------------------------------
// POST /api/recipes/grocery-list
// Expects: { user_id: '...', recipeIds: [1,2,3] }
router.post('/grocery-list', async (req, res) => {
  const { user_id, recipeIds } = req.body;
  if (!user_id || !recipeIds || !Array.isArray(recipeIds) || recipeIds.length === 0) {
    return res.status(400).json({ error: 'user_id and recipeIds array are required' });
  }
  try {
    // 1. Get all ingredients for the selected recipes
    const { data: ingredients, error: ingredientError } = await supabase
      .from('ingredients')
      .select('*')
      .in('recipe_id', recipeIds);
    if (ingredientError) {
      console.error(ingredientError);
      return res.status(500).json({ error: 'Failed to fetch ingredients' });
    }

    // 2. Ask Gemini to generate a formatted grocery list from ingredients
    // Build a short prompt listing the ingredients and ask Gemini to return a concise grocery list. //Include how many of each ingrediant should be bought.
    const prompt = `Given these ingredients, produce a concise grocery list with one item per line. Include quantities if present.\n\nIngredients:\n${ingredients
      .map(i => `- ${i.quantity || '1'} ${i.name}`)
      .join('\n')}\n\nReturn only the list, no extra commentary.`;
    let groceryListText;
    try {
      const geminiResp = await askGemini(prompt);
      groceryListText = (geminiResp || '').toString().trim();
      if (!groceryListText) {
        // fallback to simple generated text if Gemini returned nothing
        groceryListText = 'Grocery List:\n' + ingredients.map(i => `- ${i.name} (${i.quantity || '1'})`).join('\n');
      }
    } catch (gErr) {
      console.error('Gemini error generating grocery list:', gErr);
      // fallback: simple generated text using ingredients from DB
      groceryListText = 'Grocery List:\n' + ingredients.map(i => `- ${i.name} (${i.quantity || '1'})`).join('\n');
    }

    // Keep a structured JSON version based on DB ingredients (Gemini text is stored as human-readable)
    const list_json = {
      items: ingredients.map(i => ({ name: i.name, quantity: i.quantity || '1' }))
    };

    // 3. Save grocery list to grocery_lists table
    const { data: savedList, error: saveError } = await supabase
      .from('grocery_lists')
      .insert([
        {
          user_id,
          meal_ids: recipeIds,
          list_json,
          created_at: new Date().toISOString()
        }
      ])
      .select();
    if (saveError) {
      console.error(saveError);
      return res.status(500).json({ error: 'Failed to save grocery list' });
    }

    res.status(201).json({ groceryList: savedList[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/recipes/grocery-list/:id/items
router.get('/grocery-list/:id/items', async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('grocery_lists')
      .select('list_json')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(404).json({ error: 'Grocery list not found' });
    }

    // Defensive: handle missing or malformed list_json
    let items = [];
    if (data && data.list_json && Array.isArray(data.list_json.items)) {
      items = data.list_json.items;
    }

    res.json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ------------------------ INGREDIENTS TABLE ------------------------------
// GET /api/recipes/:recipe_id/ingredients
router.get('/:recipe_id/ingredients', async (req, res) => {
  try {
    const { recipe_id } = req.params;
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .eq('recipe_id', recipe_id);
    if (error) {
      console.error('Supabase error:', error);
      return res.status(404).json({ error: 'Ingredients not found' });
    }
    res.json({ ingredients: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;