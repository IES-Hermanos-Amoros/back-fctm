const saoController = require("../controllers/sao.controller")
const rutasProtegidas = require("../middlewares/rutasprotegidas.mw")
const jwtMW = require("../middlewares/jwt.mw")
const express = require("express")
const router = express.Router()

module.exports = (io) => {
    router.get("/login",saoController.showLogin)    
    router.post("/login",saoController.login)

    //TEMPORAL
    //router.post("/companies_sinc",jwtMW.authenticate,rutasProtegidas.requireProfesor,saoController.companies(io))
    router.post("/companies_sinc",saoController.companies(io))
    //router.post("/companies",jwtMW.authenticate,rutasProtegidas.requireProfesor,saoController.companiesInsertUpdateDB)
    router.post("/companies",saoController.companiesInsertUpdateDB)

    //TEMPORAL
    //router.post("/teachers",jwtMW.authenticate,rutasProtegidas.requireAdministrador,saoController.teachers(io))
    //router.post("/teachers",jwtMW.authenticate,rutasProtegidas.requireAdministrador,saoController.teachersInsertUpdateDB)
    router.post("/teachers_sinc",saoController.teachers(io))
    router.post("/teachers",saoController.teachersInsertUpdateDB)

    //TEMPORAL
    //router.post("/students_sinc",jwtMW.authenticate,rutasProtegidas.requireProfesor,saoController.students(io))
    //router.post("/students",jwtMW.authenticate,rutasProtegidas.requireProfesor,saoController.studentsInsertUpdateDB)
    router.post("/students_sinc",saoController.students(io))
    router.post("/students",saoController.studentsInsertUpdateDB)


    //PENDIENTE hacer que los profesores sincronicen sólo SUS FCTS
    //router.get("/fctsTeacher",jwtMW.authenticate,rutasProtegidas.requireProfesor,saoController.fct(io))
    //TEMPORAL
    //router.get("/fcts_sinc",jwtMW.authenticate,rutasProtegidas.requireAdministrador,saoController.fctAll(io))
    //router.post("/fcts",jwtMW.authenticate,rutasProtegidas.requireAdministrador,saoController.fctsInsertUpdateDB)
    router.post("/fcts_sinc",saoController.fct(io))
    router.post("/fcts",saoController.fctsInsertUpdateDB)


    return router
}

//module.exports = router