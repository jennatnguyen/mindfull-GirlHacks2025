const express = require('express');
const cors = require('cors');
const path = require('path');

// Load environment variables from the repository root .env file (allows .env to live outside backend/)
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const mealRoutes = require('./routes/meals');
const medRoutes = require('./routes/medicine');
const recipeRoutes = require('./routes/recipes');

const app = express();
app.use(cors());
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
	console.log(`${req.method} ${req.url} - From: ${req.ip}`);
	next();
});

// Root route for API status
app.get('/', (req, res) => {
	console.log('Root route hit');
	res.send('API is running');
});

// Routes
app.use('/api/meals', mealRoutes);
app.use('/api/medicine', medRoutes);
app.use('/api/recipes', recipeRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
