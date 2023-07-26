const router = require('express').Router();
const { adminController: controller } = require('../controllers/admin.controller');

router.get('/best-profession', controller.getBestProfession)

module.exports = router;