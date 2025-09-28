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
    // Use Gemini to generate a recipe object (or array)
    const recipes = await generateRecipes(name);
    const recipe = recipes[0]; // Use the first generated recipe
    const instructions = Array.isArray(recipe.steps) ? recipe.steps.join('\n') : '';

    const { data, error } = await supabase
      .from('recipes')
      .insert([{ name: recipe.title || name, instructions, user_id }])
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

// Get all recipes
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('recipes').select('*');
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
// Expects: { recipeIds: [1,2,3] }
router.post('/grocery-list', async (req, res) => {
  const { recipeIds } = req.body;
  if (!recipeIds || !Array.isArray(recipeIds) || recipeIds.length === 0) {
    return res.status(400).json({ error: 'recipeIds array is required' });
  }
  try {
    // Get all ingredients for the selected recipes
    const { data: ingredients, error: ingredientError } = await supabase
      .from('ingredients')
      .select('*')
      .in('recipe_id', recipeIds);
    if (ingredientError) {
      console.error(ingredientError);
      return res.status(500).json({ error: 'Failed to fetch ingredients' });
    }
    res.json({ groceryList: ingredients });
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