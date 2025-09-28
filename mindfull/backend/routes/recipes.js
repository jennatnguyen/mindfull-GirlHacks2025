const express = require('express');
const router = express.Router();
const { generateRecipes } = require('./recipeGenerator');


// POST /api/recipes/generate
// Generate recipes based on user input
router.post('/generate', async (req, res) => {
  try {
    const { userRequest } = req.body;
    
    // Validate input
    if (!userRequest || typeof userRequest !== 'string' || userRequest.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a detailed description of the meal you want.'
      });
    }
    
    // Limit request length to prevent abuse
    if (userRequest.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Request description is too long. Please keep it under 500 characters.'
      });
    }
    
    console.log('Generating recipes for request:', userRequest);
    
    // Generate recipes using Gemini AI
    const recipes = await generateRecipes(userRequest.trim());
    
    res.json({
      success: true,
      data: {
        userRequest: userRequest.trim(),
        recipes: recipes,
        generated_at: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Recipe generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate recipes. Please try again later.'
    });
  }
});

// POST /api/recipes/save
// Save a recipe to user's favorites
router.post('/save', async (req, res) => {
  try {
    const { userId, recipe } = req.body;
    
    // Validate input
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    if (!recipe || !recipe.id || !recipe.title) {
      return res.status(400).json({
        success: false,
        error: 'Valid recipe data is required'
      });
    }
    
    // Save recipe to database (lazy require)
    let supabase;
    try {
      supabase = require('../services/supabaseClient').supabase;
    } catch (e) {
      console.error('Supabase client not available:', e.message || e);
      return res.status(500).json({ success: false, error: 'Database client not configured. Please set SUPABASE_URL and ANON_KEY.' });
    }

    const { data, error } = await supabase
      .from('saved_recipes')
      .insert([
        {
          user_id: userId,
          recipe_id: recipe.id,
          recipe_data: recipe,
          saved_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Database error saving recipe:', error);
      return res.status(500).json({ success: false, error: 'Failed to save recipe to database' });
    }

    res.json({ success: true, message: 'Recipe saved successfully', data: data[0] });
    
  } catch (error) {
    console.error('Save recipe error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save recipe. Please try again later.'
    });
  }
});

// GET /api/recipes/saved/:userId
// Get user's saved recipes
router.get('/saved/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    // Lazy require supabase client
    let supabase;
    try {
      supabase = require('../services/supabaseClient').supabase;
    } catch (e) {
      console.error('Supabase client not available:', e.message || e);
      return res.status(500).json({ success: false, error: 'Database client not configured. Please set SUPABASE_URL and ANON_KEY.' });
    }

    const { data, error } = await supabase
      .from('saved_recipes')
      .select('*')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });

    if (error) {
      console.error('Database error fetching saved recipes:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch saved recipes' });
    }

    res.json({ success: true, data: data });
    
  } catch (error) {
    console.error('Fetch saved recipes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch saved recipes. Please try again later.'
    });
  }
});

// DELETE /api/recipes/saved/:userId/:recipeId
// Remove a saved recipe
router.delete('/saved/:userId/:recipeId', async (req, res) => {
  try {
    const { userId, recipeId } = req.params;
    
    // Lazy require supabase client
    let supabase;
    try {
      supabase = require('../services/supabaseClient').supabase;
    } catch (e) {
      console.error('Supabase client not available:', e.message || e);
      return res.status(500).json({ success: false, error: 'Database client not configured. Please set SUPABASE_URL and ANON_KEY.' });
    }

    const { error } = await supabase
      .from('saved_recipes')
      .delete()
      .eq('user_id', userId)
      .eq('recipe_id', recipeId);

    if (error) {
      console.error('Database error deleting recipe:', error);
      return res.status(500).json({ success: false, error: 'Failed to delete recipe' });
    }

    res.json({ success: true, message: 'Recipe removed successfully' });
    
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete recipe. Please try again later.'
    });
  }
});

module.exports = router;