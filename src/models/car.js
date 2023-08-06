const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  type: String,
  name: String,
  model: String,
  car_info: {
    type: mongoose.Schema.Types.Mixed,
  },
},{timestamps : true});

const Car = mongoose.model('Car', carSchema);

module.exports = Car;
