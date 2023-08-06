const jwt = require('jsonwebtoken');

// Secret key for JWT
const secretKey = 'your-secret-key'; // Replace with your actual secret key

// Middleware to check if the user is logged in
const isLoggedIn = async (req, res, next) => {
  const token = req.headers.authorization; // Get the token from the Authorization header

  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' });
  }
          
  // Check if the token is blacklisted in the database
  const isBlacklisted = await BlacklistedToken.exists({ token });

  if (isBlacklisted) {
    return res.status(401).json({ message: 'Token is blacklisted.' });
  }

  try {
      

    const decoded = jwt.verify(token, secretKey); // Verify the token

    // Attach the decoded user information to the request for later use
    req.user = decoded;

    next(); // Move to the next middleware or route handler
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = isLoggedIn;
