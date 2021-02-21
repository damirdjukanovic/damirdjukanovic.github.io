const express = require("express");
const User = require("../../models/users");
const Bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const {requireEmail, requirePassword, requireConfirmPassword, requireCompanyName} = require("./validators");
const router = express.Router();

router.get('/signup', async(req,res) => {
  const errors = validationResult(req);
  res.render("admin/signup", {userId: req.session.userId, errors:errors});

});

router.post('/signup', 
  [
    requireEmail,
    requirePassword,
    requireConfirmPassword,
    requireCompanyName
  ],
  async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.render("admin/signup", {errors:errors});
    }
    let {email, password, name} = req.body;

    password = Bcrypt.hashSync(password, 10);
    const user = await new User({email,name,password});

    req.session.userId = user._id;
    
    user.save();
    req.flash("messageSuccess", "Successfully logged in as " + user.name);
    res.redirect("/home");

});

router.get("/signout", (req,res) => {
  req.session.userId = null;
  
  req.flash("messageSuccess", "Successfully signed out");
  res.redirect("/home");
  
});

router.get('/signin', (req,res) => {
  res.render("admin/signin", {error1:"", error2:""});
});

router.post("/signin", async (req,res) => {
  const {email, password} = req.body;
  try {
  const user = await User.findOne({email: email}).exec();
  if(!user) {
    return res.render("admin/signin", {error1: "Email doesn't exist", error2:""});
  }

  if(!Bcrypt.compareSync(password, user.password)) {
    return res.render("admin/signin", {error1: "", error2: "Password is incorrect"});
  }

  req.session.userId = user._id;
  req.flash("messageSuccess", "Successfully logged in as " +user.name);
  res.redirect("/products");
  }
  catch (error) {
    res.status(500).send(error);
  }
})

module.exports = router;