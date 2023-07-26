const { sequelize } = require('../model');

module.exports.balanceController = {
    depositMoney: async (req, res) => {
        try {
            const { userId } = req.params;

            let { amount } = req.body;
            if (amount == undefined) return res.status(400).json({ message: "Cant deposit 0 amount" });

            const { Job, Contract, Profile } = req.app.get('models')
            const user = await Profile.findOne({
                where: {
                    id: userId
                }
            });
            if (!user) return res.status(400).json({ message: "user not found !" })

            let data = await Job.findAll({
                where: { paid: null },
                attributes: [
                    "id",
                    "description",
                    "price",
                    "paid",
                    "paymentDate",
                ],
                include: {
                    model: Contract,
                    attributes: [
                        "id",
                        "terms",
                        "status",
                        "createdAt",
                        "ContractorId"
                    ],
                    include: {
                        model: Profile,
                        // where: { id: userId },
                        as: 'Client',
                        attributes: [
                            "id",
                            "firstName",
                            "lastName",
                            "profession",
                            "type",
                        ]
                    }
                }
            });
            data = data.filter(x => x.Contract.Client.id == userId);
            const totalToPay = data.reduce((final, curr) => {
                return final + curr.price
            }, 0);

            if (amount > (totalToPay * 0.25)) {
                return res.status(400).json({
                    message: `You cant deposit more than 25% of ${totalToPay}`
                })
            }
            const transaction = await sequelize.transaction();
            try {
                await Profile.update({ balance: user.balance + amount }, {
                    where: {
                        id: user.id
                    },
                    transaction: transaction
                });
                transaction.commit();

            } catch (error) {
                transaction.rollback();
                throw error;
            }
            return res.json({ message: `${amount} added to your balance !` });
        } catch (error) {
            return res.status(500).json({ error: error.message || error })
        }
    }
}