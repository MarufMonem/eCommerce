var express     = require("express");
var router      = express.Router();
var passport    = require("passport");
var user        = require("../models/user");
var order        = require("../models/order");
var product        = require("../models/product");
var cartItem        = require("../models/cartItem");

// ROOT PATH
router.get("/", function (req, res) {

    product.find({ sex: "Male" }, function (err, allMaleProducts) {
        if (err) {
            console.log(err);
        } else {
            product.find({ sex: "Female" }, function (err, allFemaleProducts) {
                if (err) {
                    console.log(err);
                } else {
                    if(res.locals.currentUser){
                        user.findById(res.locals.currentUser._id).populate("cart").exec(function(err, foundUser){
                            res.render("index",{user:foundUser, maleProducts: allMaleProducts,femaleProducts: allFemaleProducts });
                        })
                    }else{
                        res.render("index",{maleProducts: allMaleProducts,femaleProducts: allFemaleProducts });
                    }
                }
            })
        }
    })
});

//CART ROUTE
router.get("/cartItems",isloggedIn, function (req, res) {
    user.findById(res.locals.currentUser).populate("cart").exec(function(err, foundUser){
        res.send(foundUser);
    })
});



//SIGN UP PATH
router.get("/register", function(req,res){
    res.render("register");
});

//REGISTER LOGIC ROUTE
router.post("/register", function(req, res){
    let reg1 = RegExp('[0-9]{9,11}');
    let reg2 = RegExp('[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,64}');
    // console.log("phone"  + req.body.phone + " " + reg1.test(req.body.phone));
    // console.log("email"  + req.body.email + " " + reg2.test(req.body.email));
    // console.log("age"  + req.body.age + " " + reg1.test(req.body.age));

    if(reg1.test(req.body.phone) && reg2.test(req.body.email)){
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
                req.flash("error",err.message);
                res.redirect("/register");
            }else{
                //once the user is created this would run. 
                //This logs the user in handles everything related to the session
                //then run the serialize user method
                //then specifying that we would use local strategy
                passport.authenticate("local")(req,res, function(err){
                    if(err){
                        console.log("*******UNSUCCESSFUL USER CREATION********");
                        req.flash("error",err.message);
                        res.redirect("/register");
                    }else{
                        // req.flash("success", "Welcome to pothorekha, " + newUser.username);
                        console.log("*******SUCCESSFUL USER CREATION********");
                        req.flash("success", "Welcome, " + newUser.username);
                        res.redirect("/");
                    }
                });
                // req.login(user, function(err) {
                //     if (err) {
                //       console.log(err);
                //         res.redirect("/login");
                //     }
                //      res.redirect('/');
                //   })
            }
        });
    }else{
        console.log("*******UNSUCCESSFUL USER CREATION, WRONG EMAIL OR MOBILE FORMAT********");
        req.flash("error", "Your email or mobile number or age format doesnt meet standards");
        res.redirect("/register");
    }
});

//LOGIN ROUTE
router.get("/login", function(req, res){
    res.render("login");
});

//passport authenticate middleware
router.post("/login", passport.authenticate("local", {
    successRedirect: "/", //if the login was successful
    failureRedirect: "/login", // if it wasnt
    failureFlash: true
}) , function(req, res){
});

//logging out handler
router.get("/logout", function(req, res){
    req.logOut();
    req.flash("success", "Logged you out");
    res.redirect("/");
});

//Delete user
router.delete("/user/:id", isloggedIn, function(req, res){
    let foundUndelivered=0;
    order.find({buyer: req.params.id}, function(err, foundOrders){
        console.log("**************FoundOrders: *****************" + foundOrders)
        if(err){
            console.log("ERR DELETING USER: " + err);
        }else{
            foundOrders.forEach(function(order){
                if(order.delivered == false){
                    foundUndelivered++;
                }
            })
    
            if(foundUndelivered==0){
                user.findById(req.params.id, function (err, foundUser) {
                    foundUser.remove();
                    res.redirect("/");
            });
            }else{
                 req.flash("error", "You can not delete your account while having pending orders. For order issues call or message us on social media. ");
                 res.redirect("back");
            }
        }
    })
});

//user profile route
router.get("/user/:id", isloggedIn, function(req, res){
    user.findById(req.params.id).populate("cart").exec(function (err, foundUser) {
        if(err){
            console.log(err);
        }else{
            order.find({buyer: req.params.id}).populate("cart").exec(function(err, foundOrders){
                if(err){
                    console.log(err);
                    console.log("COULDNT FIND ORDER");
                    res.render("profile",{user:foundUser});
                }else{
                    // console.log("LOOKING FOR USER ORDER LIST: " + foundOrders);
                    // console.log("FOUND THE ORDER LOOKING FOR: " + foundOrder.cart);
                    res.render("profile",{user:foundUser, userOrders: foundOrders});
                }
            })
            
        }    
});
});

//User Update Route
router.put("/user/:id", isloggedIn, function (req, res) {
    let reg1 = RegExp('[0-9]{11}');
    let reg2 = RegExp('[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,64}');
    if(reg1.test(req.body.user.phone) && reg2.test(req.body.user.email)){

        user.findByIdAndUpdate(req.params.id, req.body.user, function (err, updateduser) {
            if (err) {
                console.log(err);
                req.flash("error", "Couldnt update");
            } else {
                console.log(updateduser);
                req.flash("success", "Updated");
                res.redirect("back");
            }
            // req.flash("success", "Logged you out");
        });
    }else{
        console.log("*******UNSUCCESSFUL USER Update: WRONG EMAIL OR MOBILE FORMAT********");
        req.flash("error", "Your email or mobile number or age format doesnt meet standards");
        res.redirect("/user/" + req.params.id);
    }
});

router.put("/user/:id/passwordChange", isloggedIn, function (req, res) {
    user.findById(req.params.id, function (err, foundUser) {
        if (err) {
            console.log(err);
            req.flash("error", "Couldnt Change Password");
        } else {
                foundUser.setPassword(req.body.password, function(){
                foundUser.save();
            })
            req.logout();
            req.flash("success", "Your password has been updated. Please login again.");
            res.redirect("/login");
        }
        
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