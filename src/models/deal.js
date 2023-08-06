const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  car_id: { type: mongoose.Schema.ObjectId, ref : "Car", required: true },
  deal_info: { type: mongoose.Schema.Types.Mixed, required: true },
},{timestamps:true});

const Deal = mongoose.model('Deal', dealSchema);

module.exports = Deal;
