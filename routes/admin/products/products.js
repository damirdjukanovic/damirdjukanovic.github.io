const express = require("express");
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const {requireName, requirePrice, requireDescription, requireImage} = require("../validators");
const User = require("../../../models/users");
const Product = require("../../../models/products");
const { isLoggedIn } = require("../middlewares");

const router = express.Router();
const upload = multer({storage: multer.memoryStorage()});

//CREATE PRODUCT
router.get("/createproduct",  isLoggedIn, (req, res) => {
  const errors = validationResult(req);
  res.render("admin/createproduct", {errors:errors});
});

router.post("/createproduct", isLoggedIn,
  upload.single("image"),
  [requireName, requirePrice, requireDescription, requireImage],  
  async (req, res) => {
  const errors = validationResult(req);

    if(!errors.isEmpty()){
      return res.render("admin/createproduct", {errors:errors});
    }
    const image = req.file.buffer.toString("base64");

    const {name, price, wear, gender, description} = req.body;

  const product = await new Product({name, price, image, wear, gender, description});

  const user = await User.findOne({"_id": req.session.userId});

  product.owner = user.name.toLowerCase();
  user.products.push({"id": product._id});
  await user.save();
  await product.save();
  
  res.redirect("/products");
})

router.get("/products", isLoggedIn, async (req,res) => {
  const user = await User.findOne({"_id": req.session.userId});

    Product.find()
      .then((result) => {
        res.render("adminpanel", {result: result, user: user});
      })
      .catch((err) => {
        console.log(err);
      });
});

//VIEW PRODUCT
router.get("/products/view/:id", async (req, res) => {
  const product = await Product.findOne({_id: req.params.id});
  res.render("products/product", {product: product});
});

//EDIT PRODUCT
router.get("/product/:id/edit", isLoggedIn, async (req, res) => {
  const errors = validationResult(req);
  const product = await Product.findOne({_id: req.params.id});

  res.render("admin/editproduct", {product: product, errors: errors});
});

router.post("/product/:id/edit", isLoggedIn,
  upload.single("image"),
  [requireName, requirePrice], 
  async (req, res) => {
    const errors = validationResult(req);
    let product = await Product.findOne({_id: req.params.id});
    const user = await User.findOne({"_id": req.session.userId});

    if(!errors.isEmpty()){
      return res.render("admin/editproduct", {errors:errors, product: product});
    }
    
    if(req.file){
      product.image = req.file.buffer.toString("base64");
    }
    product.name   = req.body.name;
    product.price  = req.body.price;
    product.wear   = req.body.wear;
    product.gender = req.body.gender;
    const userName = user.name.toLowerCase();
    product.owner  = userName;
    product.save();
    res.redirect("/products");
});

//DELETE PRODUCT
router.post("/product/:id/delete", isLoggedIn, async (req, res) => {
  await Product.findByIdAndRemove(req.params.id);

  res.redirect("/products");
});

module.exports = router;