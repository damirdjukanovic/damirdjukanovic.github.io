const mongoose = require("mongoose");
const Schema = mongoose.Schema;



const cartSchema = new Schema({
  items: [
    {id: String, quantity: Number}
  ]
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;