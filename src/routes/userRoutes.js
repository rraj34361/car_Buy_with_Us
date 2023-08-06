const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // For password hashing
const User = require('../models/user');  
const isLoggedIn = require('../middleware/auth');

// Route to create a new user
router.post('/create-user', async (req, res) => {
  try {
    const { user_email, user_location, user_info, password } = req.body;

    // Check if the user with the same email already exists
    const existingUser = await User.findOne({ user_email });

    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await User.create({
      user_email,
      user_location,
      user_info,
      password: hashedPassword,
    });

    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while creating the user.' });
  }
});





// Route for user login
router.post('/login', async (req, res) => {
    try {
      const { user_email, password } = req.body;
  
      // Find the user by email
      const user = await User.findOne({ user_email });
  
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }
  
      // Compare the provided password with the hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }
  
      // Generate a JWT token
      const token = jwt.sign({ user_id: user._id }, 'your-secret-key', { expiresIn: '1h' });
  
      res.json({ token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while processing the login.' });
    }
  });




// Route for users to update their password (accessible only to logged-in users)
router.put('/update-password', isLoggedIn, async (req, res) => {
    try {
      const {  currentPassword, newPassword } = req.body;
  
      // Find the user by req.user._id
      const user = await User.findById(req.user._id);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      // Compare the provided current password with the hashed password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  
      if (!isCurrentPasswordValid) {
        return res.status(401).json({ message: 'Current password is incorrect.' });
      }
  
      // Hash the new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  
      // Update the user's password
      await User.findByIdAndUpdate(req.user._id, { password: hashedNewPassword });
  
      res.json({ message: 'Password updated successfully.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while updating the password.' });
    }
  });











  // Route for user logout (accessible only to logged-in users)
router.post('/logout', jwtAuth, async (req, res) => {
    try {
      const { authorization } = req.headers;
  
      if (!authorization) {
        return res.status(401).json({ message: 'Authorization header missing.' });
      }
  
      // Extract the token from the "Bearer" token
      const token = authorization.split(' ')[1];


      
    // Add the token to the blacklist in the database
    await BlacklistedToken.create({ token });
  
      // Blacklist the token (optional step for additional security)
      // Your logic for blacklisting tokens could go here
  
      res.json({ message: 'Logout successful.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while logging out.' });
    }
  });





module.exports = router;
