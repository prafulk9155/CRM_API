// routes/leadRoutes.js
const express = require('express');
const router = express.Router();
const ContactController = require('../controllers/contactController');


router.post('/getList', ContactController.contactList);

router.put('/update', ContactController.update);


module.exports = router;