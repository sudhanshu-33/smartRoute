const express = require('express');
const router = express.Router();
const routingController = require('../controllers/routingController');

router.post('/route', routingController.calculateRoute);
router.get('/history', routingController.getHistory);

module.exports = router;
