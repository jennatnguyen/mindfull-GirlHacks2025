const express = require('express');
const router = express.Router();
const supabase = require('../services/supabaseClient');
const { generateRecipes } = require('./recipeGenerator');

// ------------------------ RECIPES CRUD ------------------------------

// Create a new recipe with Gemini-generated instructions and user_id
router.post('/', async (req, res) => {
  const { name, user_id } = req.body;
  if (!name || !user_id) {
    return res.status(400).json({ error: 'Name and user_id are required' });
  }
  try {
    // TEMP: Mock Gemini response for testing
    const instructions = '1. Prep your ingredients.\n2. Cook everything in a pan.\n3. Serve and enjoy!';

    const { data, error } = await supabase
      .from('recipes')
      .insert([{ name, instructions, user_id }])
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

    // 2. Mock Gemini API call to generate grocery list from ingredients
    // In real use, send the ingredients array to Gemini and get a formatted grocery list
    const groceryListText = 'Grocery List:\n' + ingredients.map(i => `- ${i.name} (${i.quantity || '1'})`).join('\n');
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