const jwt = require('jsonwebtoken');

const isLoggedOut = (req, res, next) => {
    // Get the token from the request header
    const token = req.headers.authorization;

    if (!token) {
        // If there is no token, the user is not logged in
        return next();
    }

    // Verify the token and extract the user ID
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
        if (err) {
            // If there is an error, the token is invalid
            return next();
        }

        // The token is valid, so the user is already logged in
        return res.status(401).json({ error: 'You are already logged in' });
    });
};

module.exports = isLoggedOut;