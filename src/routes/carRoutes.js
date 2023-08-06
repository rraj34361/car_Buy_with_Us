const express = require('express');
const axios = require('axios');

const router = express.Router();

// Import your models and any authentication middleware here
const Car = require('../models/car'); // Replace with your actual model
const isLoggedIn = require('../middleware/auth'); // Replace with your authentication middleware
const Dealership = require('../models/dealerShip');
const User = require('../models/user');

// Route to view all cars (accessible only to logged-in users)
router.get('/cars', isLoggedIn, async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while fetching cars.' });
  }
});



// Route to view all cars in a dealership (accessible only to logged-in users)
router.get('/dealership/cars', isLoggedIn, async (req, res) => {
    try {
      const {cars}= await Dealership.find({}).populate('cars'); // Assuming user's dealership info is stored in the token
      res.json(cars);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while fetching cars.' });
    }
  });

  

  // Route to view dealerships with a certain car (accessible only to logged-in users)
router.get('/dealerships-with-car/:carId', isLoggedIn, async (req, res) => {
  try {
    const carId = req.params.carId;

    // Find the car by carId
    const car = await Car.findById(carId);

    if (!car) {
      return res.status(404).json({ message: 'Car not found.' });
    }

    // Find dealerships with the specified car
    const dealerships = await Dealership.find({ cars: carId }).populate('cars');

    res.json(dealerships);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while fetching dealerships.' });
  }
})



// Route to view all vehicles owned by a user (accessible only to logged-in users)
router.get('/my-vehicles', isLoggedIn, async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user's ID is stored in the token

    // Find vehicles owned by the user
    const {vehicles_info} = await User.findById(userId).populate('vehicle_info');

    res.json(vehicles_info);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while fetching vehicles.' });
  }
});




// Route to view dealerships within a certain range based on user location (accessible only to logged-in users)
router.get('/nearby-dealerships', isLoggedIn, async (req, res) => {
  try {
    const userLocation = req.query.location; // Get user's location from query parameter
    const radius = 5000; // Set the radius in meters

    // Call the Google Places API to find nearby places (dealerships)
    const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with your API key
    const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${userLocation}&radius=${radius}&type=car_dealer&key=${apiKey}`;

    const response = await axios.get(apiUrl);
    const nearbyPlaces = response.data.results;

    // Get a list of nearby dealership names
    const nearbyDealerships = nearbyPlaces.map(place => place.name);

    // Find dealerships with names in the nearbyDealerships list
    const dealerships = await Dealership.find({ name: { $in: nearbyDealerships } });

    res.json(dealerships);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while fetching nearby dealerships.' });
  }
});






// Route to view all deals on a certain car (accessible only to logged-in users)
router.get('/car-deals/:carId', isLoggedIn, async (req, res) => {
  try {
    const carId = req.params.carId;

    // Find deals related to the specified car
    const deals = await Deal.find({ car_id: carId });

    res.json(deals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while fetching deals.' });
  }
});





// Route to view all deals from a certain dealership (accessible only to logged-in users)
router.get('/dealership-deals/:dealershipId', isLoggedIn, async (req, res) => {
  try {
    const dealershipId = req.params.dealershipId;

    // Find deals related to the specified dealership
    const deals = await Deal.find({ dealership_id: dealershipId });

    res.json(deals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while fetching deals.' });
  }
});






// Route to allow a user to buy a car after a deal is made (accessible only to logged-in users)
router.post('/buy-car/:dealId', isLoggedIn, async (req, res) => {
  try {
    const dealId = req.params.dealId;

    // Find the deal based on the dealId
    const deal = await Deal.findById(dealId);

    if (!deal) {
      return res.status(404).json({ message: 'Deal not found.' });
    }

    // Update the car's ownership status
    await Car.findByIdAndUpdate(deal.car_id, { owner: deal.user_id });

    // Update the user's purchased cars
    await User.findByIdAndUpdate(deal.user_id, { $push: { purchasedCars: deal.car_id } });

    // Optionally, you can update the deal status to indicate that the car has been bought

    res.json({ message: 'Car purchase successful.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while processing the car purchase.' });
  }
});



  

module.exports = router;
