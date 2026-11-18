const express = require('express');
const healthController = require('../controllers/healthController');

const router = express.Router();

router.get('/health', healthController.getHealth);
router.get('/ready', healthController.getReady);

module.exports = router;
