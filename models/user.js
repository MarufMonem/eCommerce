var mongoose        = require("mongoose");
var passportLocalMongoose   = require("passport-local-mongoose");
//Schema setup
var userSchema = new mongoose.Schema({
    name: String,
    address: String,
    email: String,
    password: String,
    phone: Number,
    admin: Boolean,
    orders: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "order"
        }
    ]
});

userSchema.plugin(passportLocalMongoose);
module.exports= mongoose.model("user",userSchema);