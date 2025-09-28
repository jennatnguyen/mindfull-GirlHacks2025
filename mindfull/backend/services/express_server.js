require('dotenv').config();
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
app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/medications', require('./routes/medications'));
app.use('/api/medication-schedules', require('./routes/schedules'));
app.use('/api/medication-logs', require('./routes/logs'));

// generic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ ok: false, error: err.message || 'server error' });
});

app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(process.env.PORT || 3000, () => console.log('Server running'));