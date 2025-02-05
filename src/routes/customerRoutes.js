const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/customerController');

router.post('/add', CustomerController.create);
router.get('/getList', CustomerController.findAll);
router.get('/', CustomerController.findById);
router.get('/count', CustomerController.count);
router.put('/update', CustomerController.update);
router.get('/search', CustomerController.search);
router.delete('/delete', CustomerController.delete);

module.exports = router;
