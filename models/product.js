var mongoose = require("mongoose");
var productSchema = new mongoose.Schema({
    title: String,
    price: String,
    image: String,
    description: String,
    sex: String,
    date: Date
});
module.exports = mongoose.model("product", productSchema);