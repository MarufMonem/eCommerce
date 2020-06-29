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

//passport authenticate middleware
router.post("/login", passport.authenticate("local", {
    successRedirect: "/", //if the login was successful
    failureRedirect: "/login" // if it wasnt
    // failureFlash: true
}) , function(req, res){
    
});

//logging out handler
router.get("/logout", function(req, res){
    req.logOut();
    // req.flash("success", "Logged you out");
    res.redirect("/");
});

//Delete user
router.delete("/user/:id", isloggedIn, function(req, res){
    user.findById(req.params.id, function (err, foundUser) {

        // foundCamp.comments.forEach(function (commentID) {
        //     comment.findByIdAndDelete(commentID, function (err) {
        //         console.log("DELETED");
        //     });
        // });
        foundUser.remove();
    // req.flash("success", "Logged you out");
    res.redirect("/admin/users");
});
});

//Delete user
router.get("/user/:id", isloggedIn, function(req, res){
    user.findById(req.params.id, function (err, foundUser) {

        if(err){
            console.log(err);
        }else{
            res.render("profile",{user:foundUser});
        }    
});
});

//PRODUCT DELETE ROUTE
router.put("/user/:id", isloggedIn, function (req, res) {
    user.findByIdAndUpdate(req.params.id, req.body.user, function (err, updateduser) {
        if (err) {
            console.log(err);
        } else {
            console.log(updateduser);
            // req.flash("success", "Campground updated!");
            res.redirect("/user/" + req.params.id);
        }
        // req.flash("success", "Logged you out");
    });
});


//logged in checker
function isloggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    // req.flash("error", "You need to logged in to do that!");
    res.redirect("/login");
}

function isAdmin(req, res, next) {
    if (req.isAuthenticated()) {
        if(req.user.admin === true){
            console.log("PERSON IS ADMIN******************")
            return next();
        }else{
            console.log("PERSON IS NOT ADMIN******************")
            res.send("ONLY FOR ADMIN");
        }
    }else{
        res.redirect("/login");
    }
}

module.exports = router;