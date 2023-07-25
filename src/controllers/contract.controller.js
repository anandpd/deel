const { Op } = require("sequelize");

module.exports.contractController = {
    getContractsById: async (req, res) => {
        try {
            const { Contract } = req.app.get('models')
            const { id: profileId } = req.profile;
            const { id: contractId } = req.params
            const contract = await Contract.findOne({
                where: {
                    id: contractId,
                    [Op.or]: {
                        ContractorId: profileId,
                        ClientId: profileId
                    }
                }
            })
            if (!contract) return res.status(404).json({
                message: "Not Found",
                data: null
            })
            res.status(200).json({ contract })
        } catch (error) {
            return res.status(500).json({ error })
        }
    },
    getcontractsByUser: async (req, res) => {
        try {
            const { Contract } = req.app.get('models')
            const { id: profileId } = req.profile;
            const contracts = await Contract.findAll({
                where: {
                    [Op.or]: {
                        ContractorId: profileId,
                        ClientId: profileId
                    },
                    status: {
                        [Op.ne]: "terminated"
                    }
                },
                order: [
                    ["createdAt", "DESC"]
                ]
            })
            res.status(200).json({ contracts })
        } catch (error) {
            return res.status(500).json({ error: error?.message || error });
        }
    }
}