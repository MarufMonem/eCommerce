var mongoose = require("mongoose");

var productSchema = new mongoose.Schema({
    title: String,
    price: String,
    image: String,
    description: String,
    sex: String,
    date: {type: Date, default:Date.now},
    sizeXL: Number,
    sizeLG: Number,
    sizeMD: Number,
    sizeSM: Number,
    
});

module.exports = mongoose.model("product", productSchema);