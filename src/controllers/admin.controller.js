const { Op } = require("sequelize");
const { sequelize } = require('../model');

module.exports.adminController = {
    getBestProfession: async (req, res) => {
        try {
            const { start, end } = req.query;
            if (!start || !end) {
                return res.status(400).json({ message: 'start/end is required ' })
            }
            const { Contract, Profile, Job } = req.app.get('models');
            let data = await Job.findOne({
                where: {
                    paid: { [Op.ne]: null },
                    [Op.and]: [
                        { createdAt: { [Op.gte]: new Date(start) } },
                        { createdAt: { [Op.lte]: new Date(end) } }
                    ]
                },
                attributes: [
                    [sequelize.fn('sum', sequelize.col('price')), 'total_amount'],
                ],
                group: [
                    'profession'
                ],
                include: {
                    model: Contract,
                    include: {
                        model: Profile,
                        as: 'Contractor',
                        attributes: [
                            'profession'
                        ]
                    },

                },
                order: [
                    ['total_amount', 'DESC']
                ],
                limit: 1,
                raw: true
            });

            let response = {
                total: 0,
                profession: 'N/A'
            }
            if (data != null) {
                response.total = data['total_amount'];
                response.profession = data['Contract.Contractor.profession'];
            }
            return res.json({ response });
        } catch (error) {
            return res.status(500).json({
                message: error.message || error
            })
        }
    },

    getBestClients: async (req, res) => {
        try {
            let { start, end, limit } = req.query;
            const { Profile, Job, Contract } = req.app.get('models');
            if (!start || !end) return res.status(400).json({ message: 'start/end is required ' })
            if (!limit) limit = 2;

            const data = await Job.findAll({
                where: {
                    paid: true,
                    [Op.and]: [
                        { createdAt: { [Op.gte]: new Date(start) } },
                        { createdAt: { [Op.lte]: new Date(end) } }
                    ]
                },
                include: {
                    model: Contract,
                    include: {
                        model: Profile,
                        as: 'Client',
                        attributes: [
                            // 'id'
                        ]
                    },
                    attributes: [
                        ['ClientId', 'clientId']
                    ]
                    // group: ['ContractId']
                },
                raw: true,
                attributes: [
                    [sequelize.literal("firstName || ' ' || lastName"), 'fullName'],
                    [sequelize.fn('sum', sequelize.col('price')), 'paid'],
                ],
                group: [
                    [sequelize.literal("firstName || ' ' || lastName"), 'fullName']
                ],
                order: [
                    ['paid', 'DESC']
                ],
                limit: +limit
            });
            return res.json({ limit: +limit, data });
        } catch (error) {
            return res.status(500).json({
                message: error.message || error
            })
        }
    }
}