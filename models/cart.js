var mongoose = require("mongoose");
// var product                 = require("../models/product");
var cartSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    product: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "cartItem"

        }
    ]

}) 