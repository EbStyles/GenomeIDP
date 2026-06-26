const User = require("../models/users")
const jwt = require("jsonwebtoken")

// ─────────────────────────────────────────────────────────────────────────────
// createToken
// Generates a signed JWT for the given user ID.
//
// FIX (Phase 1): Added `expiresIn: "7d"` so tokens automatically expire after
// 7 days. Previously tokens had no expiry, meaning a stolen token would remain
// valid indefinitely.
//
// @param {string} _id  - MongoDB ObjectId of the authenticated user
// @returns {string}    - Signed JWT string
// ─────────────────────────────────────────────────────────────────────────────
const createToken = (_id) => {
    return jwt.sign({ _id: _id }, process.env.SECRET, { expiresIn: "7d" })
}

// ─────────────────────────────────────────────────────────────────────────────
// loginUser
// Authenticates an existing user and returns a JWT.
//
// Route:   POST /api/auth/login
// Body:    { username: string, password: string }
// Returns: { username, token }
// ─────────────────────────────────────────────────────────────────────────────
const loginUser = async (req, res) => {
    const { username, password } = req.body

    try {
        const user = await User.login(username, password)

        // Create a token with 7-day expiry
        const token = createToken(user._id)

        res.status(200).json({ username, token })

    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// signupUser
// Registers a new user and returns a JWT.
//
// Route:   POST /api/auth/signup
// Body:    { username: string, password: string }
// Returns: { username, user, token }
// ─────────────────────────────────────────────────────────────────────────────
const signupUser = async (req, res) => {
    const { username, password } = req.body

    try {
        const user = await User.signup(username, password)

        // Create a token with 7-day expiry
        const token = createToken(user._id)

        res.status(200).json({ username, user, token })

    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = { signupUser, loginUser }
