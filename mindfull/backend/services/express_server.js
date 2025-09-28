const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');


const app = express();
app.use(helmet());
app.use(cors({ origin: true })); // restrict in prod
app.use(express.json({ limit: '100kb' }));
app.use(morgan('tiny'));

// mount routes
app.use('/api/recipes', require('../routes/meals')); //api/recipes handles routes in meals.js
app.use('/api/medications', require('../routes/medicine'));

// generic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ ok: false, error: err.message || 'server error' });
});

app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(process.env.PORT || 3000, () => console.log('Server running'));