var mongoose = require("mongoose");

var productSchema = new mongoose.Schema({
    title: String,
    price: String,
    image: String,
    description: String,
    sex: String,
    date: {type: Date, default:Date.now}
});

module.exports = mongoose.model("product", productSchema);