require('dotenv').config()
const jwt = require('jsonwebtoken')
const AppError = require('../utils/AppError')
const { SAO_Data } = require('../models/SAO.model')

function extractToken(req) {
  //TO DO
  let token = null

  // intento: obtenerlo del header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }
  // intento: obtenerlo del cookie
  else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt
  }

  return token
}

function extractSAOToken(req) {
  //TO DO
  let token = null

  // intento: obtenerlo del header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }
  // intento: obtenerlo del cookie
  else if (req.cookies && req.cookies.SAOtoken) {
    token = req.cookies.SAOtoken
  }

  return token
}

exports.protect = (req, res, next) => {
  const token = extractToken(req)
  //TO DO
  if (!token) {
    return next(
      new AppError('No estás autenticado. Por favor, inicia sesión.', 401)
    )
  }

  try {
    // validar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // guardamos el usuario en req.user
    req.user = decoded
    next()
  } catch (error) {
    return next(new AppError('Token inválido o expirado.', 401))
  }
}

exports.protectSAO = (req, res, next) => {
  const token = extractSAOToken(req)
  //TO DO
  if (!token) {
    return next(
      new AppError('No estás autenticado. Por favor, inicia sesión con SAO FCT.', 401)
    )
  }

  try {
    // validar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // guardamos el usuario en req.user
    req.user = decoded
    next()
  } catch (error) {
    return next(new AppError('Token de SAO inválido o expirado.', 401))
  }
}

exports.createJWT = (req, res, next, userData, cookieName = 'jwt', expireTimeMs = 3600000) => {
  try {
    //TO DO
    const payload = {
      username: userData.username,
      profile: userData.profile,
      id: userData._id,
      SAO_id: userData.SAO_id || null, // Agregamos los datos de SAO al payload
      tokenType: cookieName,
      avatar:userData.avatar || null,
      name:userData.name
    }

    // Convertimos milisegundos a segundos para la opción 'expiresIn' de JWT
    const seconds = Math.floor(expireTimeMs / 1000);

    // expiración en 1 hora
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: `${seconds}s`,
    })

    // configuración de la cookie
    const cookieOptions = {
      expires: new Date(Date.now() + expireTimeMs), //Tiempo parametrizable
      httpOnly: true, ////No sean accesibles desde JS (document.cookie)
      secure:true, //HTTPS
      sameSite:"none" //Dominios distintos front y back
    }

    res.cookie(cookieName, token, cookieOptions)

    return token
  } catch (error) {
    next(new AppError(error.message, 500))
  }
}
