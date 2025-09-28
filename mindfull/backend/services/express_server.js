const express = require('express');
const router = express.Router();
const generateRecipes = require('../services/recipeGenerator');

router.post('/search', async (req, res) => {
  const query = req.body.query;
  if (!query || typeof query !== 'string') return res.status(400).json({ ok:false, error:'query required' });
  try {
    const recipes = await generateRecipes(query, req.body.preferences || {});
    return res.json({ ok:true, recipes });
  } catch (err) {
    console.error('recipe search error', err);
    return res.status(502).json({ ok:false, error: err.message || 'Upstream error' });
  }
});

module.exports = router;