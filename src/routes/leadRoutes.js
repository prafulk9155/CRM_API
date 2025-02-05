// routes/leadRoutes.js
const express = require('express');
const router = express.Router();
const LeadController = require('../controllers/leadController');

router.post('/add', LeadController.create);
router.post('/getList', LeadController.leadList);
router.post('/getLeadById', LeadController.findById);
router.put('/update', LeadController.update);
// router.delete('/delete/:id', LeadController.deleteLead);

module.exports = router;