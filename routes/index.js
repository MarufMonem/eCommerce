var express     = require("express");
var router      = express.Router();
var passport    = require("passport");
var user        = require("../models/user");

// ROOT PATH
router.get("/", function (req, res) {
    res.render("index");
});

//SIGN UP PATH
router.get("/register", function(req,res){
    res.render("register");
});

//REGISTER LOGIC ROUTE
router.post("/register", function(req, res){
    user.register(
        new user(
            {
                username    : req.body.username, 
                address     : req.body.address,
                phone       : req.body.phone,
                email       : req.body.email,
                age         : req.body.age
            }
            ), req.body.password, function(err, newUser){
        if(err){
            console.log("There is an error: " + err );
            // req.flash("error",err.message);
            res.redirect("/register");
        }else{
            //once the user is created this would run. 
            //This logs the user in handles everything related to the session
            //then run the serialize user method
            //then specifying that we would use local strategy
            passport.authenticate("local")(req,res, function(err){
                if(err){
                    console.log("*******UNSUCCESSFUL USER CREATION********");
                }else{
                    // req.flash("success", "Welcome to pothorekha, " + newUser.username);
                    console.log("*******SUCCESSFUL USER CREATION********");
                    res.redirect("/");
                }
                
            });
        }
    });
});

//LOGIN ROUTE
router.get("/login", function(req, res){
    res.render("login");
});



module.exports = router;