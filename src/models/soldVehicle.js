const mongoose = require('mongoose');

const soldVehicleSchema = new mongoose.Schema({
 
  car_id: { type: mongoose.Schema.ObjectId,ref : "Car", required: true },
  vehicle_info: { type: mongoose.Schema.Types.Mixed, required: true },
},{timestamps:true});

const SoldVehicle = mongoose.model('SoldVehicle', soldVehicleSchema);

module.exports = SoldVehicle;
