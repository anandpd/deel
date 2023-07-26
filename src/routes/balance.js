const router = require('express').Router();
const { balanceController: controller } = require('../controllers/balance.controller');
const { getProfile } = require('../middleware/getProfile');

router.post('/deposit/:userId', controller.depositMoney);

module.exports = router;