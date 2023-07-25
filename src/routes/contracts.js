const router = require('express').Router();
const { Op } = require('sequelize');
const {contractController: controller} = require('../controllers/contract.controller');
const { getProfile } = require('../middleware/getProfile');

router.get('/:id', getProfile, controller.getContractsById);
router.get('/', getProfile, controller.getcontractsByUser);



module.exports = router;