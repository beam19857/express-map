var mongoose = require('mongoose');
  
var imageSchema = new mongoose.Schema({
    latitude: String,
    longitude: String,
    image: String
});

module.exports = new mongoose.model('Image', imageSchema);
  