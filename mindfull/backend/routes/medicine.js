const express = require('express');
const router = express.Router();

// get user's medications
router.get('/:userId', async (req, res) => {
	const { userId } = req.params;
	try {
		const { data, error } = await supabase
		.from ('medications')
		.select('*')
		.eq('user_id', userId);
	
	if (error) {
		console.error('Supabase error:', error);
		return res.status(500).json({error: 'Failed to fetch meals'});
	}
	res.json({ medications: data });
	}
	catch(err){
		console.error(err);
		res.status(500).json({error: 'Server error'});
	}
});

// Get scheduled time for a medication
router.get('/:userId', async (req, res) => {
	const { userId } = req.params;
	try{
	const{ data, error } = await supabase
	.from('medication_schedules')
	.select('scheduled_time')
	.eq('user_id', userId)

	if (error) {
		console.error('Supabase error:', error);
		return res.status(500).json({error: 'Failed to fetch scheduled times'});
	}
	res.json({ scheduled_times: data });
	}
	catch (err){
		console.error(err);
		res.status(500).json({error: 'Server error'});
	}
})


// POST a new medication
router.post('/', async (req, res) => {
	try{
		const { user_id, name, dose, description, color, shape } = req.body;
	
	if (!user_id || !name || !dose ){
		return res.status(400).json({
			error: 'Missing required fields'
		});
	}
	const { data, error } = await supabase
	.from('medications')
	.insert([{ user_id, name, dose, description, color, shape}])
	.select()

	if (error){
		console.error('Supabase error:', error);
		return res.status(500).json({ error: 'Failed to add medication' });
	}
	res.status(201).json({
		message: 'Medication added successfully',
		medication: data[0]
	});
	}
	catch (err){
		res.status(500).json({ error: 'Server error' });
	}
});

