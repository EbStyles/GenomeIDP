require('dotenv').config()
const express = require('express')
const cors = require('cors')
const formRoutes = require('./routes/form')
const authRoutes = require('./routes/auth')
const matchRoutes = require('./routes/match');
const notesRoutes = require('./routes/notes')
const mongoose = require("mongoose")

// Create the Express app
const app = express()

// Middleware that runs every time a request comes in
app.use(cors())
app.use(express.json())

// Log information about the request
app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

// Define routes
app.use("/api/form", formRoutes)
app.use("/api/auth", authRoutes)
app.use('/api/match', matchRoutes);
app.use('/api/notes', notesRoutes);

//Start Database and listen to requests

mongoose.connect(process.env.MONG_URI)
.then(() => {

    app.listen(process.env.PORT, () => {
        console.log(`Connected to db and listening on port ${process.env.PORT || 4000}!`)
    })


}).catch((error) => {

    console.log(error)

});


// Start the server after routes are set

