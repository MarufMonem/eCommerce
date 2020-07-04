var mongoose = require("mongoose");
//Schema setup
var orderSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    delivered: { type: Boolean, default: false },
    // contains the buyers info
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    //Points to the created cart by the buyer    
    cart: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "cartItem"
        }
    ]
});

module.exports = mongoose.model("order", orderSchema);