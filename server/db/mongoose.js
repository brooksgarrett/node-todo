var mongoose = require('mongoose');

// Establish MongoDB Connection
mongoose.Promise = global.Promise;
const dbUrl = process.env.MONGODB_URI;
mongoose.connect(dbUrl);

module.exports = {mongoose};
