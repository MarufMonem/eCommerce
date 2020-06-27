var mongoose                = require("mongoose");

//Schema setup
var orderSchema = new mongoose.Schema({
    date: {type: Date, default:Date.now},
    delivered: {type: Boolean, default: false},
    buyer:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"user"
        }
    },
    product: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product"
        }
    ]
});

module.exports= mongoose.model("order",orderSchema);