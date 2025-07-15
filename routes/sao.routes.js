const saoController = require("../controllers/sao.controller")
const rutasProtegidas = require("../middlewares/rutasprotegidas.mw")
const jwtMW = require("../middlewares/jwt.mw")
const express = require("express")
const router = express.Router()

module.exports = (io) => {
    router.post("/login",saoController.login)

    router.get("/companies",jwtMW.authenticate,rutasProtegidas.requireProfesor,saoController.companies(io))
    router.post("/companies",jwtMW.authenticate,rutasProtegidas.requireProfesor,saoController.companiesInsertUpdateDB)

    router.get("/teachers",jwtMW.authenticate,rutasProtegidas.requireAdministrador,saoController.teachers(io))
    router.post("/teachers",jwtMW.authenticate,rutasProtegidas.requireAdministrador,saoController.teachersInsertUpdateDB)

    router.get("/students",jwtMW.authenticate,rutasProtegidas.requireProfesor,saoController.students(io))
    router.post("/students",jwtMW.authenticate,rutasProtegidas.requireProfesor,saoController.studentsInsertUpdateDB)

    //PENDIENTE hacer que los profesores sincronicen sólo SUS FCTS
    //router.get("/fctsTeacher",jwtMW.authenticate,rutasProtegidas.requireProfesor,saoController.fct(io))
    router.get("/fcts",jwtMW.authenticate,rutasProtegidas.requireAdministrador,saoController.fctAll(io))
    router.post("/fcts",jwtMW.authenticate,rutasProtegidas.requireAdministrador,saoController.fctsInsertUpdateDB)


    return router
}

//module.exports = router