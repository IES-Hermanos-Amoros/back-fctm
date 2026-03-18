const logger = require('../utils/logger')

// Dato inválido en un campo específico (CastError de Mongoose)
const handleCastErrorDB = err => {
  const message = `Dato inválido para ${err.path}: ${err.value}.`
  return { message, status: 400 }
}

// Valor duplicado en un campo único (E11000 de MongoDB)
const handleDuplicateFieldsDB = err => {
  let message
  if (err.keyValue) {
    const field = Object.keys(err.keyValue)[0]
    const value = Object.values(err.keyValue)[0]
    message = `Campo duplicado ${field}: ${value}. Por favor, usa otro valor.`
  } else if (err.errmsg) {
    const match = err.errmsg.match(/(["'])(\\?.)*?\1/)
    const value = match ? match[0] : 'desconocido'
    message = `Valor de campo duplicado: ${value}. Por favor, usa otro valor.`
  } else {
    message = 'Valor de campo duplicado. Por favor, usa otro valor.'
  }
  return { message, status: 400 }
}

// Errores de validación de Mongoose
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message)
  const message = `Datos de entrada inválidos. ${errors.join('. ')}`
  return { message, status: 400 }
}

// Token JWT inválido
const handleJWTError = () => {
  return {
    message: 'Token inválido. Por favor, inicia sesión de nuevo.',
    status: 401,
  }
}

// Token JWT expirado
const handleJWTExpiredError = () => {
  return {
    message: 'El token ha expirado. Por favor, inicia sesión de nuevo.',
    status: 401,
  }
}

// Error de sintaxis en JSON (cuerpo de la petición mal formado)
const handleSyntaxError = () => {
  return {
    message: 'Formato JSON inválido en el cuerpo de la petición.',
    status: 400,
  }
}

// Errores relacionados con la subida de archivos usando Multer
const handleMulterError = err => {
  let message = `Error al subir archivo: ${err.message}`
  if (err.code === 'LIMIT_FILE_SIZE')
    message = 'El archivo es demasiado grande (Máximo 10MB).'
  if (err.code === 'LIMIT_UNEXPECTED_FILE')
    message = 'Campo de archivo inesperado. Revisa el formulario.'
  return { message, status: 400 }
}

// Error de versión de Mongoose (VersionError, __v) por conflictos de concurrencia
const handleVersionErrorDB = () => {
  return {
    message:
      'Conflicto de concurrencia: El documento ha sido modificado por otro proceso.',
    status: 409,
  }
}

// Errores de Axios al hacer peticiones a servicios externos
const handleAxiosError = err => {
  const message = `Fallo en el servicio externo (Axios): ${err.message}`
  return { message, status: err.response?.status || 502 }
}

// Errores del sistema de archivos, red y otros errores de bajo nivel
const handleSystemError = err => {
  let message = 'Error del sistema de archivos o red.'
  if (err.code === 'ENOENT')
    message = `Archivo o ruta no encontrada: ${err.path}`
  if (err.code === 'EACCES')
    message = 'Permiso denegado para acceder al sistema.'
  if (err.code === 'ECONNREFUSED')
    message = 'Conexión rechazada por el servidor de destino.'
  return { message, status: 500 }
}

// Error cuando el cuerpo de la petición es demasiado grande
const handlePayloadTooLarge = () => {
  return {
    message: 'El cuerpo de la petición es demasiado grande para ser procesado.',
    status: 413,
  }
}

// Error de timeout en peticiones o procesos que tardan demasiado
const handleTimeoutError = () => {
  return {
    message: 'La petición ha tardado demasiado tiempo (timeout).',
    status: 408,
  }
}

// Errores de conexión a la base de datos, como fallos en la conexión a MongoDB Atlas
const handleMongooseConnectionError = () => {
  return {
    message: 'Error de conexión con la base de datos. Inténtalo más tarde.',
    status: 503,
  }
}

// Errores relacionados con Bcrypt, como fallos en la encriptación o comparación de contraseñas
const handleBcryptError = () => {
  return {
    message: 'Error en el proceso de encriptación o seguridad.',
    status: 500,
  }
}

// Envío de error detallado en desarrollo, incluyendo stack trace y objeto de error completo
const sendErrorDev = (err, res) => {
  logger.error.error(`Error Handler(${err.status}): ${err.message}`)
  res.status(err.status).json({
    err: err.message,
    //stack: err.stack,
    //error: err,
  })
}

// En producción, solo enviar mensajes de error operativos y no mostrar detalles técnicos
const sendErrorProd = (err, res) => {
  // Error operativo de confianza: enviar mensaje al cliente
  if (err.isOperational || err.status < 500) {
    res.status(err.status).json({
      err: err.message,
    })
  } else {
    // Error interno del servidor u otro error desconocido: no mostrar detalles al cliente
    logger.error.error('ERROR 💥', err)
    res.status(500).json({
      err: 'Algo ha ido muy mal en el servidor.',
    })
  }
}

// Middleware de manejo de errores global
exports.errorHandler = (err, req, res, next) => {

  console.log("Err: ", err)

  err.status = err.status || 500
  err.message = err.message || 'ERROR GENERAL'

  let error = { ...err }
  error.message = err.message
  error.name = err.name
  error.code = err.code
  error.stack = err.stack

  if (error.name === 'CastError')
    error = { ...error, ...handleCastErrorDB(error), isOperational: true }
  if (error.code === 11000)
    error = { ...error, ...handleDuplicateFieldsDB(error), isOperational: true }
  if (error.name === 'ValidationError')
    error = { ...error, ...handleValidationErrorDB(error), isOperational: true }
  if (error.name === 'JsonWebTokenError')
    error = { ...error, ...handleJWTError(), isOperational: true }
  if (error.name === 'TokenExpiredError')
    error = { ...error, ...handleJWTExpiredError(), isOperational: true }
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err)
    error = { ...error, ...handleSyntaxError(), isOperational: true }
  if (err.name === 'MulterError')
    error = { ...error, ...handleMulterError(err), isOperational: true }
  if (err.name === 'VersionError')
    error = { ...error, ...handleVersionErrorDB(), isOperational: true }
  if (err.isAxiosError)
    error = { ...error, ...handleAxiosError(err), isOperational: true }

  // Errores de sistema, base de datos y seguridad
  if (
    err.code === 'ENOENT' ||
    err.code === 'EACCES' ||
    err.code === 'ECONNREFUSED'
  )
    error = { ...error, ...handleSystemError(err), isOperational: true }
  if (err.name === 'MongooseServerSelectionError')
    error = {
      ...error,
      ...handleMongooseConnectionError(),
      isOperational: true,
    }
  if (err.type === 'entity.too.large')
    error = { ...error, ...handlePayloadTooLarge(), isOperational: true }
  if (err.name === 'TimeoutError')
    error = { ...error, ...handleTimeoutError(), isOperational: true }
  if (err.message && err.message.includes('bcrypt'))
    error = { ...error, ...handleBcryptError(), isOperational: true }

  console.log(`Error capturado por el middleware de manejo de errores: ${error.message} (Status: ${error.status})`)
  console.log("Entorno", process.env.NODE_ENV)

  if (process.env.NODE_ENV !== 'development') {
    sendErrorDev(error, res)
  } else {
    // En producción no se quiere mostrar seguimientos de pila ni objetos de error detallados.
    sendErrorProd(error, res)
  }
}
