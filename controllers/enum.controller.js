const enumService = require("../services/enum.service.js")

//Obtener todos los enums
exports.getAll = async (req, res) => {
    try {
        const enums = await enumService.getAllEnums()
        res.status(200).json(enums)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

//Obtener el enum mediante por el nombre
exports.getEnumByName = async (req, res) => {
    try {
        const { name } = req.params
        const nameEnum = await enumService.getEnumByName(name)

        if(! nameEnum ) {
            return res.status(404).json({ message: 'Enumerado no encontrado' })
        }

        res.status(200).json(nameEnum)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}