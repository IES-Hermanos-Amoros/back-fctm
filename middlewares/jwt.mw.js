require("dotenv").config()
const jwt = require("jsonwebtoken")
const AppError = require("../utils/AppError")

function extractToken(req){
    //TO DO
}

exports.protect = (req,res,next) => {
    const token = extractToken(req)
    //TO DO
}

exports.createJWT = (req,res,next,userData) => {
    try {
        //TO DO

    } catch (error) {
        next(new AppError(error.message,500))
    }
}