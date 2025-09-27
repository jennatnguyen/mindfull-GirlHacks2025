const express = require('express');
const router = express.Router();

// Example GET route
router.get('/', (req, res) => {
	res.json({ message: 'Medicine route is working!' });
});

module.exports = router;
