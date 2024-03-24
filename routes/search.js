const express = require('express');
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require('../utils/wrapAsync.js');

router.post("/", wrapAsync(async (req, res) => {
  console.log(req.body);
  const searchQuery = req.body.search; // Extract search query from request body
  const listingItems = await Listing.find({ title: { $regex: searchQuery, $options: 'i' } });
  res.render('listings/index.ejs', { allListings: listingItems });
}));

module.exports = router;