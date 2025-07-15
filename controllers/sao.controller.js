const saoService = require("../services/sao.service")
const userManagerModel = require("../models/userManager.model")
const fctManagerModel = require("../models/fctManager.model")
const {wrapAsync} = require("../utils/functions")
const AppError = require("../utils/AppError")
const jwtMW = require("../middlewares/jwt.mw")


exports.login = wrapAsync(async (req,res,next)=>{
    //const { username, password } = req.body    
    const userData = req.body
    await saoService.loginService(userData,async function(err,userFound){
        if(err){
            next(new AppError(err,404))
        }else{
            //req.session.userLogued = userLogued
            //Accedemos al perfil del usuario
            console.log(userData)
            const jwtToken = jwtMW.createJWT(req,res,next,userData)
            /*console.log("LOGIN USER FOUND----------INI")
            let jsonString = JSON.stringify(userFound);
            jsonString = jsonString.replace(/SAO_Data/g, '');
            const modifiedObj = JSON.parse(jsonString);            
            console.log(modifiedObj)
            console.log("LOGIN USER FOUND----------FIN")*/
            const modifiedObj = userFound
            const userLogued = {
                data: modifiedObj,
                token: jwtToken
            }                
            req.session.userLogued = userLogued
            console.log("LOGIN SESSION----------INI")            
            console.log(req.session.userLogued)
            console.log("LOGIN SESSION----------FIN")

            //res.render("SAO/dashboard.ejs")
            res.status(200).json(userLogued)            
        }
    })
})

exports.companies = (io) => wrapAsync(async (req,res,next)=>{
    const userData = req.decoded.userData        
    await saoService.companiesSinc(io,res,userData,async function(err,companyList){
        if(err){
            next(new AppError(err,404))
        }else{
            res.status(200).json(companyList)            
        }
    })
})

exports.companiesInsertUpdateDB = wrapAsync(async (req,res,next)=>{
    const {newCompanies, updatedCompanies} = req.body        
    if((newCompanies && newCompanies.length > 0) || (updatedCompanies && updatedCompanies.length > 0)){
        await userManagerModel.insertUpdateManyUsers(newCompanies,updatedCompanies,async function(err,resultData){
            if(err){
                next(new AppError(err,404))
            }else{
                res.status(200).json(resultData)            
            }
        })
    } else {
        next(new AppError("No hay datos desde Request para insertar/actualizar",404))
    }
})

exports.teachers = (io) => wrapAsync(async (req,res,next)=>{
    const userData = req.decoded.userData        
    await saoService.teachersSinc(io,res,userData,async function(err,teacherList){
        if(err){
            next(new AppError(err,404))
        }else{
            res.status(200).json(teacherList)            
        }
    })
})

exports.teachersInsertUpdateDB = wrapAsync(async (req,res,next)=>{
    const {newTeachers, updatedTeachers} = req.body        
    if((newTeachers && newTeachers.length > 0) || (updatedTeachers && updatedTeachers.length > 0)){
        await userManagerModel.insertUpdateManyUsers(newTeachers,updatedTeachers,async function(err,resultData){
            if(err){
                next(new AppError(err,404))
            }else{
                res.status(200).json(resultData)            
            }
        })
    } else {
        next(new AppError("No hay datos desde Request para insertar/actualizar",404))
    }
})


exports.students = (io) => wrapAsync(async (req,res,next)=>{
    const userData = req.decoded.userData        
    await saoService.studentsSinc(io,res,userData,async function(err,studentList){
        if(err){
            next(new AppError(err,404))
        }else{
            res.status(200).json(studentList)            
        }
    })
})

exports.studentsInsertUpdateDB = wrapAsync(async (req,res,next)=>{
    const {newStudents, updatedStudents} = req.body        
    if((newStudents && newStudents.length > 0) || (updatedStudents && updatedStudents.length > 0)){
        await userManagerModel.insertUpdateManyUsers(newStudents,updatedStudents,async function(err,resultData){
            if(err){
                next(new AppError(err,404))
            }else{
                res.status(200).json(resultData)            
            }
        })
    } else {
        next(new AppError("No hay datos desde Request para insertar/actualizar",404))
    }
})


exports.fct = (io) => wrapAsync(async (req,res,next)=>{
    const userData = req.decoded.userData
    //const {verTodasFCT = false} = req.params
    await saoService.FCTSinc(io,res,userData,async function(err,studentList){
        if(err){
            next(new AppError(err,404))
        }else{
            res.status(200).json(studentList)            
        }
    },false)
})

exports.fctAll = (io) => wrapAsync(async (req,res,next)=>{
    const userData = req.decoded.userData
    //const {verTodasFCT = false} = req.params
    await saoService.FCTSinc(io,res,userData,async function(err,studentList){
        if(err){
            next(new AppError(err,404))
        }else{
            res.status(200).json(studentList)            
        }
    },true)
})


exports.fctsInsertUpdateDB = wrapAsync(async (req,res,next)=>{
    const {newFCT, updatedFCT} = req.body        
    if((newFCT && newFCT.length > 0) || (updatedFCT && updatedFCT.length > 0)){
        await fctManagerModel.insertUpdateManyFCT(newFCT,updatedFCT,async function(err,resultData){
            if(err){
                next(new AppError(err,404))
            }else{
                res.status(200).json(resultData)            
            }
        })
    } else {
        next(new AppError("No hay datos desde Request para insertar/actualizar",404))
    }
})