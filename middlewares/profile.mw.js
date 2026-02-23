const AppError = require('../utils/AppError')

exports.restrictTo = (...profiles) => {
  //TO DO
  return (req, res, next) => {
    if (!profiles.includes(req.user.profile)) {
      return next(new AppError('No tienes permisos', 403))
    }
    next()
  }
}
