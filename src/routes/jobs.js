const router = require('express').Router();
const { getProfile } = require('../middleware/getProfile');
const { jobController: controller } = require('../controllers/job.controller');


router.get('/unpaid', getProfile, controller.getMyUnpaidJobs);
router.post('/:job_id/pay', getProfile, controller.payForAJob);

module.exports = router;