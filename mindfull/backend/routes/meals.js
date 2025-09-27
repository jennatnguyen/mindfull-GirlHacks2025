const express = require('express');
const router = express.Router();
const supabase = require('../services/supabaseClient');

// POST /api/meals - create a new meal
router.post('/', async (req, res) => {
  const { name, user_id } = req.body;

  if (!name || !user_id) {
    return res.status(400).json({ error: 'Name and user_id are required' });
  }

  try {
    const { data, error } = await supabase
      .from('meals')
      .insert([{ name, user_id }])
      .select(); // returns the inserted row

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to create meal' });
    }

    res.status(201).json({ meal: data[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
