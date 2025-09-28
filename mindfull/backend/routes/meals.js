const express = require('express');
const router = express.Router();
const supabase = require('../services/supabaseClient');

// ------------------------ MEAL TABLE ------------------------------

// DELETE /api/meals/:id - delete a meal
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to delete meal' });
    }

    res.json({ message: 'Meal deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/meals/:userId - fetch all meals for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch meals' });
    }

    res.json({ meals: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

//GET /api/meals/:id - fetch a single meal (meal id)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(404).json({ error: 'Meal not found' });
    }

    res.json({ meal: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

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

// ------------------------ RECIPE TABLE ------------------------------