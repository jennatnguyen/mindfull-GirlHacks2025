const express = require('express');
const cors = require('cors');
require('dotenv').config();

const mealRoutes = require('./routes/meals');
const medRoutes = require('./routes/medicine');

const app = express();
app.use(cors());
app.use(express.json());
// Root route for API status
app.get('/', (req, res) => {
	res.send('API is running');
});

// Routes
app.use('/api/meals', mealRoutes);
app.use('/api/medicine', medRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
