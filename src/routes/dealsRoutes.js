
const express = require('express');
const router = express.Router();
const isLoggedIn = require('../middleware/auth'); // Replace with your JWT authentication middleware
const Deal = require('../models/deal'); // Replace with your Deal model
const Car = require('../models/car'); // Replace with your Car model
const Dealership = require('../models/dealerShip');



// Route for creating a new deal (accessible only to authorized users)
router.post('/create-deal', jwtAuth, async (req, res) => {
  try {
    const {  car_id, deal_info } = req.body;

    // Check if a deal with the same deal_id already exists
    const existingDeal = await Deal.findOne({ deal_id });

    if (existingDeal) {
      return res.status(409).json({ message: 'Deal with this ID already exists.' });
    }

    // Create a new deal
    const newDeal = await Deal.create({
      deal_id,
      car_id,
      deal_info
    });

    res.status(201).json(newDeal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while creating the deal.' });
  }
});

 



// Route to view all cars sold by a dealership (accessible only to logged-in users)
router.get('/dealership-sold-cars/:dealershipId', isLoggedIn, async (req, res) => {
  try {
    const dealershipId = req.params.dealershipId;

    // Find deals related to the specified dealership
    const deals = await Deal.find({ dealership_id: dealershipId });

    // Extract car IDs from the deals
    const carIds = deals.map(deal => deal.car_id);

    // Find cars with the extracted car IDs
    const cars = await Car.find({ _id: { $in: carIds } });

    res.json(cars);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while fetching sold cars.' });
  }
});




// Route to add cars to a dealership (accessible only to authorized users)
router.post('/add-cars/:dealershipId', isLoggedIn, async (req, res) => {
    try {
      const dealershipId = req.params.dealershipId;
      const { cars } = req.body; // Assuming the request body contains an array of car objects
  
      // Find the dealership based on the dealershipId
      const dealership = await Dealership.findById(dealershipId);
  
      if (!dealership) {
        return res.status(404).json({ message: 'Dealership not found.' });
      }
  
      // Create cars and associate them with the dealership
      const createdCars = await Car.create(cars.map(car => ({ ...car, dealership: dealershipId })));
  
      // Update the dealership's car inventory
      await Dealership.findByIdAndUpdate(dealershipId, { $push: { cars: { $each: createdCars.map(car => car._id) } } });
  
      res.json(createdCars);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while adding cars to the dealership.' });
    }
  });





// Route to view deals provided by a dealership (accessible only to logged-in users)
router.get('/dealership-deals/:dealershipId', isLoggedIn, async (req, res) => {
    try {
      const dealershipId = req.params.dealershipId;
  
      // Find deals provided by the specified dealership
      const deals = await Deal.find({ dealership_id: dealershipId });
  
      res.json(deals);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while fetching dealership deals.' });
    }
  });




// Route to add deals to a dealership (accessible only to authorized users)
router.post('/add-deals/:dealershipId', isLoggedIn, async (req, res) => {
  try {
    const dealershipId = req.params.dealershipId;
    const { deals } = req.body; // Assuming the request body contains an array of deal objects

    // Find the dealership based on the dealershipId
    const dealership = await Dealership.findById(dealershipId);

    if (!dealership) {
      return res.status(404).json({ message: 'Dealership not found.' });
    }

    // Associate each deal with the dealership
    const createdDeals = await Deal.create(deals.map(deal => ({ ...deal, dealership_id: dealershipId })));

    res.json(createdDeals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while adding deals to the dealership.' });
  }
});




// Route to view all vehicles sold by a dealership (accessible only to logged-in users)
router.get('/dealership-sold-vehicles/:dealershipId', isLoggedIn, async (req, res) => {
    try {
      const dealershipId = req.params.dealershipId;
  
      // Find deals related to the specified dealership
      const deals = await Deal.find({ dealership_id: dealershipId });
  
      // Extract vehicle IDs from the deals
      const vehicleIds = deals.map(deal => deal.vehicle_id);
  
      // Find vehicles with the extracted vehicle IDs
      const vehicles = await Vehicle.find({ _id: { $in: vehicleIds } });
  
      res.json(vehicles);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while fetching sold vehicles.' });
    }
  });
  


// Route to create a new deal (accessible only to authorized users)
router.post('/create-deal', isLoggedIn, async (req, res) => {
    try {
      const { vehicleId, dealershipId, userId, dealInfo } = req.body;
  
      // Find the vehicle based on the vehicleId
      const vehicle = await Vehicle.findById(vehicleId);
  
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found.' });
      }
  
      // Create a new deal
      const newDeal = await Deal.create({
        vehicle_id: vehicleId,
        dealership_id: dealershipId,
        user_id: userId,
        deal_info: dealInfo
      });
  
      // Update the vehicle's status to indicate it has been sold
      await Vehicle.findByIdAndUpdate(vehicleId, { sold: true });
  
      // Update the dealership's sold vehicles list
      await Dealership.findByIdAndUpdate(dealershipId, { $push: { soldVehicles: vehicleId } });
  
      res.json(newDeal);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while creating the deal.' });
    }
  });
  


module.exports = router;




