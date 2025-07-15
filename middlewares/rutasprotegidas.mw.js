const AppError = require("../utils/AppError")

const checkProfile = (req,profileParam) => {
    //console.log(req.session.userLogued)
    if(req.session &&
        req.session.userLogued &&
        req.session.userLogued.data &&
        req.session.userLogued.data.SAO_profile &&
        req.session.userLogued.data.SAO_profile == profileParam
    )
    {
        return true
    }else{
        return false
    }
}

exports.requireAdministrador = (req,res,next) => {
    if(checkProfile(req,"ADMINISTRADOR")){
        next()
    }else{
        next(new AppError("No estás autorizado",403)) //Forbidden
    }
}

exports.requireProfesor = (req,res,next) => {
    if(checkProfile(req,"PROFESOR") || checkProfile(req,"ADMINISTRADOR")){
        next()
    }else{
        next(new AppError("No estás autorizado",403)) //Forbidden
    }
}