const express = require('express')
const { newForm, getForm, updateForm } = require("../controllers/userContoller")
const requireAuth = require('../middleware/requireauth')

const router = express.Router()

//require auth for form data
router.use(requireAuth)

//get one user
router.get("/", getForm)

//Add a new user
router.post("/", newForm)

//Update existing form data
router.patch("/", updateForm)

module.exports = router