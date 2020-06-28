var mongoose        = require("mongoose");
var passportLocalMongoose   = require("passport-local-mongoose");
//Schema setup
var userSchema = new mongoose.Schema({
    username: String,
    address: String,
    email: String,
    password: String,
    phone: {type:Number, unique:true},
    age: Number,
    admin: {type:Boolean, default:false},
    orders: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "order"
        }
    ]
});

userSchema.plugin(passportLocalMongoose);
module.exports= mongoose.model("user",userSchema);