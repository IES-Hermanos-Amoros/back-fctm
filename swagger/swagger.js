require("dotenv").config()
const swaggerJsdoc = require("swagger-jsdoc")

const options = {
    definition:{
        openapi:'3.0.0',
        info:{
            title:"API FCT Manager BackEnd",
            version: process.env.API_VERSION,
            contact:{
                name: "IES Hermanos Amorós"
            },
            servers:[
                {
                    url:"http://localhost:" + process.env.PUERTO,
                    description: "Local Server"
                }
            ]
        }
    },
    apis:['./routes/*js'] //Todos los archivos JS en las rutas serán los que podrán recibir documentación
}

const specs = swaggerJsdoc(options)
module.exports = specs