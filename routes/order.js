var express = require("express");
var router = express.Router();
var product = require("../models/product");
var order = require("../models/order");
const user = require("../models/user");
const cartItem = require("../models/cartItem");


router.post("/cart/confirmed", function(req,res){
    var userOrder = {
        buyer: res.locals.currentUser._id,
        cart: res.locals.currentUser.cart
    }

    order.create(userOrder, function(err, newOrder){
        if(err){
            console.log(err);
        }else{
            console.log(newOrder);
            res.locals.currentUser.cart.forEach(function(item){
                res.locals.currentUser.cart.remove({_id: item.id});
            })
            res.locals.currentUser.save();
        }
    });

    res.redirect("/user/" + res.locals.currentUser._id);

});

router.delete("/cart/:id", function(req,res ){
    //res.send("The user is: " + res.locals.currentUser + "The users cart contains: " +  res.locals.currentUser.cart + "item id: " + req.params.id);
    res.locals.currentUser.cart.remove({_id: req.params.id});
    res.locals.currentUser.save();
    res.redirect("back");
})



router.post("/:id/cartAdd",isloggedIn, function (req, res) {
    //get all campgrounds
    user.findOne(res.locals.currentUser._id, function (err, foundUser) {
        if (err) {
            console.log("NO USER");
        } else {
            console.log("USER before: " + foundUser);
            // product.find(req.params.id, function(err, product))
            cartItem.create(req.body.cartItem, function(err, newCartItem){
                if(err){
                    console.log(err);
                }else{
                    product.findById(req.params.id, function(err, foundProduct){
                        if(err){
                            console.log(err);
                        }else{
                            newCartItem.id= req.params.id; //assigning th eproduct id
                            newCartItem.productName = foundProduct.title;
                            newCartItem.save(function(err, newCart){
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
module.exports = router;
