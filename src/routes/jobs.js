const router = require('express').Router();
const { Op } = require('sequelize');
const { getProfile } = require('../middleware/getProfile');


router.get('/unpaid', getProfile, async (req, res) => {
    try {
        const { Job, Contract } = req.app.get('models')
        const { id: profileId } = req.profile;

        let activeJobs = await Job.findAll({
            where: {
                paid: null
            },
            attributes: [['id', 'jobId'], 'description', 'price', 'createdAt', 'updatedAt', 'contractId'],
            include: {
                model: Contract,
                where: {
                    status: "in_progress",
                    [Op.or]: {
                        "ContractorId": profileId,
                        "ClientId": profileId
                    }
                },
                attributes: [ 'status' ]
            },
            order: [
                ['createdAt', 'DESC']
            ],
        });

        return res.json({ message: `Active job for user with id=${profileId}`, activeJobs: activeJobs });

    } catch (error) {
        return res.status(500).json({ error: error?.message || error });
    }
});
router.post('/:job_id/pay')

module.exports = router;