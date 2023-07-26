const { sequelize } = require("../model");
const { Op } = require("sequelize");

module.exports.jobController = {
    getMyUnpaidJobs: async (req, res) => {
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
                    attributes: ['status']
                },
                order: [
                    ['createdAt', 'DESC']
                ],
            });

            return res.json({ message: `Active job for user with id=${profileId}`, activeJobs: activeJobs });

        } catch (error) {
            return res.status(500).json({ error: error?.message || error });
        }
    },

    payForAJob: async (req, res) => {
        try {
            const { Job, Contract, Profile } = req.app.get('models');
            const jobDetails = await Job.findOne({
                where: {
                    id: req.params.job_id
                },
                attributes: [
                    "id",
                    "description",
                    "price",
                    "paid",
                    "paymentDate",
                    "createdAt",
                    "updatedAt",
                ],
                include: {
                    model: Contract,
                    attributes: [
                        "id",
                        "terms",
                        "status",
                        "createdAt",
                        "updatedAt",
                        "ClientId",
                    ],
                    include: {
                        model: Profile,
                        as: 'Contractor',
                        attributes: [
                            "id",
                            "firstName",
                            "lastName",
                            "type",
                            "balance"
                        ]
                    }
                }
            });
            const transaction = await sequelize.transaction();
            let user = null;
            try {
                user = await Profile.findOne({ where: { id: req.profile.id } }, { transaction: transaction, lock: true });
                if (user.balance < jobDetails.price) return res.status(400).json({ message: "Not enough balance !" });
                
                // Debit from source
                await Profile.update({ balance: user.balance - jobDetails.price }, {
                    where: {
                        id: req.profile.id
                    },
                    transaction: transaction
                });

                // Credit to target
                await Profile.update({ balance: jobDetails.Contract.Contractor.balance + jobDetails.price }, {
                    where: {
                        id: jobDetails.Contract.Contractor.id
                    },
                    returning: true,
                    transaction: transaction
                });

                // Update job status
                await Job.update({paid: 1, paymentDate: new Date()}, {
                    where: {
                        id: req.params.job_id
                    },
                    transaction: transaction
                });

                transaction.commit();
            } catch (error) {
                transaction.rollback();
                console.log("Rolled back. ...");
                return res.status(500).json({ error: error?.message || error });
            }

            return res.json({ message: `Successfully paid for your job jobId = ${req.params.job_id} to contractor = ${jobDetails.Contract.Contractor.firstName}!`});
        } catch (error) {
            return res.status(500).json({ error: error?.message || error });
        }
    }
}
