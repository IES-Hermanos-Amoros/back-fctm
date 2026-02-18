require('dotenv').config()
const jwt = require('jsonwebtoken')
const AppError = require('../utils/AppError')

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
    const decoded = jwt.verify(token, process.env.SECRET_JWT)

    // guardamos el usuario en req.user
    req.user = decoded
    next()
  } catch (error) {
    return next(new AppError('Token inválido o expirado.', 401))
  }
}

exports.createJWT = (req, res, next, userData) => {
  try {
    //TO DO
    const payload = {
      username: userData.username,
      profile: userData.profile,
      id: userData._id,
    }

    // expiración en 1 hora
    const token = jwt.sign(payload, process.env.SECRET_JWT, {
      expiresIn: '1h',
    })

    // configuración de la cookie
    const cookieOptions = {
      expires: new Date(Date.now() + 60 * 60 * 1000),
      httpOnly: true,
    }

    res.cookie('jwt', token, cookieOptions)

    return token
  } catch (error) {
    next(new AppError(error.message, 500))
  }
}
