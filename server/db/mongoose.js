var mongoose = require('mongoose');

// Establish MongoDB Connection
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TodoApp');

module.exports = {mongoose};
