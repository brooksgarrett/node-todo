var mongoose = require('mongoose');

// Establish MongoDB Connection
mongoose.Promise = global.Promise;
const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/TodoApp';
mongoose.connect(dbUrl);

module.exports = {mongoose};
