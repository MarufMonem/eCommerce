var express = require("express");
var router = express.Router();
var product = require("../models/product");
var order = require("../models/order");
const user = require("../models/user");
const cartItem = require("../models/cartItem");


router.post("/cart/confirmed", function (req, res) {
    var userOrder = {
        buyer: res.locals.currentUser._id,
        cart: res.locals.currentUser.cart
    }

    order.create(userOrder, function (err, newOrder) {
        if (err) {
            console.log(err);
        } else {
            // console.log("NEW CREATED ORDER IS: " + newOrder);
            console.log("USERS CART LOOKS LIKE : " + res.locals.currentUser.cart);
            var cartInfo = res.locals.currentUser.cart; //Storing the cart array inside a variable
            var loopLength= cartInfo.length;
            console.log("LENGTH OF CART IS :" + cartInfo.length); //Prints the length of the array
            var countingItems = 0; //variable to keep track of how many items are traversed
            console.log("**************ENTER LOOP****************");
            for (var i = 0; i < loopLength;i++ ) {
                console.log("REMOVING: " + cartInfo[0]);
                res.locals.currentUser.cart.remove({ _id: cartInfo[0] });

                // cartItem.findById(cartInfo[0], function (err, foundCartItem) {
                // if(err){
                //     console.log(err);
                // }else{
                //     foundCartItem.remove();
                // }
                // });
                // console.log("cartInfo: " + cartInfo);
                // console.log("i: " + i);

            }
            res.locals.currentUser.save();
        }
    });

    res.redirect("/user/" + res.locals.currentUser._id);

});

router.delete("/cart/:id", function (req, res) {
    //res.send("The user is: " + res.locals.currentUser + "The users cart contains: " +  res.locals.currentUser.cart + "item id: " + req.params.id);
    res.locals.currentUser.cart.remove({ _id: req.params.id });
    res.locals.currentUser.save();
    cartItem.findById(req.params.id, function (err, foundCartItem) {
        if (err) {
            console("ERR DELETEING CART ITEM :  " + err);
        } else {
            foundCartItem.remove();
        }

    });
    res.redirect("back");
})

router.put("/confirm/:id",isAdmin,function(req,res){
    let update = {delivered:true};
    order.findByIdAndUpdate(req.params.id, update, function(err, foundOrder){
        if(err){
            console.log("Couldnt Update");
        }else{
            res.redirect("/admin");
        }
    })
});

router.delete("/delete/:id",isAdmin,function(req,res){

    order.findById(req.params.id, function(err, foundOrder){
        if(err){
            console.log("Couldnt Update");
        }else{
            foundOrder.remove();
            res.redirect("back");
        }
    })
});


router.post("/:id/cartAdd", isloggedIn, function (req, res) {
    //get all campgrounds
    user.findOne(res.locals.currentUser._id, function (err, foundUser) {
        if (err) {
            console.log("NO USER");
        } else {
            console.log("USER before: " + foundUser);
            // product.find(req.params.id, function(err, product))
            cartItem.create(req.body.cartItem, function (err, newCartItem) {
                if (err) {
                    console.log(err);
                } else {
                    product.findById(req.params.id, function (err, foundProduct) {
                        if (err) {
                            console.log(err);
                        } else {
                            newCartItem.id = req.params.id; //assigning th eproduct id
                            newCartItem.productName = foundProduct.title;
                            newCartItem.price = parseInt(foundProduct.price);
                            newCartItem.save(function (err, newCart) {
                                foundUser.cart.push(newCart);
                                foundUser.save(function (err, saveduser) {
                                    if (err) {
                                        console.log("There was an error");
                                    } else {
                                        console.log("saved");
                                        // console.log("SAVED USER: " + saveduser);
                                        console.log("USER Looks like this now: " + saveduser);
                                        res.redirect("back");
                                    }
                                })
                            });
                        }
                    });

                }

            });


        }
    })
});


//MIDDLE WARE
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

