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

// GET /api/medication-logs/:userId (get adherence history)
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('medication_logs')
            .select(`
                *,
                medications (name, dosage)
            `)
            .eq('user_id', userId)
            .order('taken_at', { ascending: false });

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
router.post('/', async (req, res) => {	
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
        const { name, dosage, frequency, instructions } = req.body;

        const { data, error } = await supabase
            .from('medications')
            .update({ name, dosage, frequency, instructions })
            .eq('id', id)
            .select();

        if (error) throw error;

        if (data.length === 0) {
            return res.status(404).json({ error: 'Medication not found' });
        }

        res.json({ 
            message: 'Medication updated successfully', 
            medication: data[0] 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/medications/:id (remove medication)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('medications')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ message: 'Medication deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/medication-schedules (set reminder times)
router.post('/', async (req, res) => {
    try {
        const { medication_id, reminder_time, days_of_week } = req.body;

        if (!medication_id || !reminder_time) {
            return res.status(400).json({ 
                error: 'Missing required fields: medication_id, reminder_time' 
            });
        }

        const { data, error } = await supabase
            .from('medication_schedules')
            .insert([{ medication_id, reminder_time, days_of_week }])
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