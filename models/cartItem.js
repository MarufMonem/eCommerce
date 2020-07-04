var mongoose = require("mongoose");
// var product                 = require("../models/product");
var cartItemSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product"
    },
    productName: String,
    size: String,
    amount: { type: Number, default: 1 }

}) 
module.exports = mongoose.model("cartItem", cartItemSchema);