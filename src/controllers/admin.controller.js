const { Op } = require("sequelize");
const { sequelize } = require('../model');

module.exports.adminController = {
    getBestProfession: async (req, res) => {
        try {
            const { start, end } = req.query;
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
                response = {
                    total: data['total_amount'],
                    profession: data['Contract.Contractor.profession']
                }
            }
            return res.json({ response });
        } catch (error) {
            return res.status(500).json({
                message: error.message || error
            })
        }
    }
}