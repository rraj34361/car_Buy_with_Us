const mongoose = require('mongoose');




// Define a schema for the token blacklist
const BlacklistedTokenSchema = new mongoose.Schema({
    token: String,
    createdAt: { type: Date, expires: '1d', default: Date.now } // Automatically delete entries after 1 day
  });
  
  const BlacklistedToken = mongoose.model('BlacklistedToken', BlacklistedTokenSchema);

  module.exports = BlacklistedToken