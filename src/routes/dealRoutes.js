// routes/dealRoutes.js
const express = require('express');
const router = express.Router();
const DealController = require('../controllers/dealController');

router.post('/dealList', DealController.dealList);
router.put('/update', DealController.update);

module.exports = router;