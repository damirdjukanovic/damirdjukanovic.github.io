const express = require("express");
const Product = require("../../models/products");

const router = express.Router();

router.post("/search", async(req, res) => {
  const search = req.body.search.toLowerCase();
  const originalSearch = req.body.search;
  const product = await Product.find({$or: [{wear: search}, {owner: search}]});
  res.render("customer/search", {result: product, search: search, originalSearch: originalSearch});
});

router.get("/search/:product", async(req, res) => {
  const search  = req.params.product.toLowerCase();
  const originalSearch = req.body.search;
  const product = await Product.find({$or: [{wear: search}, {gender: search}, {owner: search}]});
  res.render("customer/search", {result: product, search: search, originalSearch: originalSearch});
});





module.exports = router;