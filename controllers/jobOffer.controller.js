const jobOfferService = require("../services/jobOffer.service")

exports.findAllJobOffers = async(req,res)=>{
    try {
        const offers = await jobOfferService.getAllJobOffer()
        res.status(200).json(offers)
    } catch (error) {
        res.status(500).json(error)
    }
}

exports.findJobOfferById= async(req,res)=>{
    try {
        const {id} = req.params
        const offer = await jobOfferService.getJobOfferById(id)
        res.status(200).json(offer)
    } catch (error) {
        res.status(500).json(error)
    }
}

exports.postJobOffer= async(req,res)=>{
    try {
        const newOffer = await jobOfferService.createJobOffer(req.body)
        res.status(200).json(newOffer)
    } catch (error) {
        res.status(500).json(error)
    }
}

exports.editJobOffer= async(req,res)=>{
    try {
        const updatedOffer = await jobOfferService.updateJobOffer(req.params.id,req.body)
        res.status(200).json(updatedOffer)
    } catch (error) {
        res.status(500).json(error)
    }
}

exports.deleteJobOffer= async(req,res)=>{
    try {
        const removedOffer = await jobOfferService.removeJobOffer(req.params.id)
        res.status(200).json(removedOffer)
    } catch (error) {
        res.status(500).json(error)
    }
}

