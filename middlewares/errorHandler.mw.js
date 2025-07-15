const logger = require("../utils/logger")

exports.errorHandler = (err,req,res,next) => {
    const { status = 500, message = "ERROR GENERAL" } = err
    //console.log("Dentro de ErrorHandler")
    //console.log(err)
    logger.error.error(`Error Handler(${status}): ${err}`)
    res.status(status).json({err:message})
}