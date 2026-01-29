const reviewService = require('../services/review.service')

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await reviewService.getAll()
    res.status(200).josn(reviews)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todas las reseñas.' })
  }
}

exports.getReviewById = async (req, res) => {
  try {
    const { id } = req.params
    const review = await reviewService.getById(id)
    if(!review){
        res.status(404).json({ error: 'No se encontró la reseña.'})
    }

    res.status(200).json(review)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la reseña.' })
  }
}

exports.createReview = async (req, res) => {
  try {
    const { id } = req.params
    const review = await reviewService.create(id)
    if(!review){
        res.status(404).json({ error: 'No se encontró la reseña.'})
    }

    res.status(200).json(review)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la reseña.' })
  }
}

exports.editReviewById = async (req, res) => {
  try {
    const { id } = req.params
    const { rating, comment } = req.body
    const review = await reviewService.update(id, rating, comment)
    if(!review){
        res.status(404).json({ error: 'No se encontró la reseña.'})
    }

    res.status(200).json(review)
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la reseña.' })
  }
}

exports.deleteReviewById = async (req, res) => {
  try {
    const { id } = req.params
    const review = await reviewService.delete(id)
    if(!review){
        res.status(404).json({ error: 'No se encontró la reseña.'})
    }

    res.status(200).json(review)
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la reseña.' })
  }
}

exports.getNewReview = async (req, res) => {
  try {
    const review = await reviewService.getNewReview()
    res.status(200).json(review)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la reseña.' })
  }
}