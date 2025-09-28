const express = require('express');
const router = express.Router();
const supabase = require('../services/supabaseClient');

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
		return res.status(500).json({error: 'Failed to fetch medications'});
	}
	res.json({ medications: data });
	}
	catch(err){
		console.error(err);
		res.status(500).json({error: 'Server error'});
	}
});

// Get scheduled time for a medication
router.get('/schedules/:userId', async (req, res) => {
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

// GET /api/medications/logs/:userId (get adherence history)
router.get('/logs/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('medication_logs')
            .select(`
                *,
                medications (name, dose)
            `)
            .eq('user_id', userId)
            .order('taken_time', { ascending: false });

        if (error) throw error;

        res.json({ logs: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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

// POST medication skip
router.post('/logs', async (req, res) => {	
	const status = 'skipped';
	try {
	const { user_id, medication_id, scheduled_time, reason } = req.body;

	if(!medication_id || !reason ){
			return res.status(400).json({
			error: 'Missing required fields'});
	}
	const { data, error } = await supabase
	.from('medication_logs')
	.insert([{ user_id, medication_id, scheduled_time, status, reason}])
	.select()

	if(error){
		console.error('Supabase error:', error);
		return res.status(500).json({ error: 'Failed to log skipped medication' });
	}
	res.status(201).json({
		message: 'Medication skip logged successfully',
		log: data[0]
	});
	}
	catch (error){
		res.status(500).json({ error: 'Server error' });
	}
});

//PUT 
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, name, dose, description, color, shape } = req.body;

		/*
        if (!user_id) {
            return res.status(400).json({ error: 'user_id is required' });
        }*/

        const { data, error } = await supabase
            .from('medications')
            .update({ name, dose, description, color, shape })
            .eq('id', id)
            //.eq('user_id', user_id)  // Only update if user owns it
            .select();

        if (error) throw error;

        if (data.length === 0) {
            return res.status(404).json({ error: 'Medication not found or access denied' });
        }

        res.json({ 
            message: 'Medication updated successfully', 
            medication: data[0] 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        //const { user_id } = req.body;

        //if (!user_id) {
          //  return res.status(400).json({ error: 'user_id is required' });
        //}

        const { error } = await supabase
            .from('medications')
            .delete()
            .eq('id', id)
            //.eq('user_id', user_id);  // Only delete if user owns it

        if (error) throw error;

        res.json({ message: 'Medication deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/medication-schedules (set reminder times)
router.post('/schedule', async (req, res) => {
    try {
        const {medication_id, user_id, scheduled_time } = req.body;

        if (!scheduled_time || !medication_id) {
            return res.status(400).json({ 
                error: 'Missing required fields: medication_id, reminder_time' 
            });
        }

        const { data, error } = await supabase
            .from('medication_schedules')
            .insert([{ medication_id, user_id, scheduled_time }])
            .select();

        if (error) throw error;

        res.status(201).json({ 
            message: 'Schedule created successfully', 
            schedule: data[0] 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;