const router = require('express').Router();
const { balanceController: controller } = require('../controllers/balance.controller');

router.post('/deposit/:userId', controller.depositMoney);

module.exports = router;