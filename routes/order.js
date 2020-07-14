var express = require("express");
var router = express.Router();
var product = require("../models/product");
var order = require("../models/order");
const user = require("../models/user");
const cartItem = require("../models/cartItem");


router.get("/orderConfirm", isloggedIn, function (req, res) {
    user.findById(res.locals.currentUser._id).populate("cart").exec(function (err, foundUser) {
        if (err) {
            console.log("Error finding the user." + err);
        } else {
            console.log("Founduser looks like " + foundUser);
            console.log("Founduser cart looks like " + foundUser.cart);
            console.log("Founduser cart looks like " + foundUser.product);
            res.render("orderConfirm", { user: foundUser });
        }

    })
})
//If the uder places the order
router.post("/cart/confirmed", function (req, res) {
    var userOrder = {
        buyer: res.locals.currentUser._id,
        cart: res.locals.currentUser.cart
    }
    order.create(userOrder, function (err, newOrder) {
        if (err) {
            console.log(err);
            req.flash("error", "Couldnt create the order " + err);
        } else {
            // console.log("NEW CREATED ORDER IS: " + newOrder);
            var cartInfo = res.locals.currentUser.cart; //Storing the cart array inside a variable
            var loopLength = cartInfo.length;
            var countingItems = 0; //variable to keep track of how many items are traversed
            for (var i = 0; i < loopLength; i++) {
                console.log("CART INFO: " + cartInfo[0]);
                cartItem.findById(cartInfo[0], function (err, foundCart) {
                    if (err) {
                        console.log("ERR finding the cart: " + err);
                        req.flash("error", "Cart not found " + err);
                    } else {
                        product.findById(foundCart.id, function (err, foundCartProduct) {
                            if (foundCart.size.localeCompare("Small") == 0) {
                                foundCartProduct.sizeSM = foundCartProduct.sizeSM - foundCart.amount;
                                if (foundCartProduct.sizeSM < 0) {
                                    res.send("Sorry your product: " + foundCartProduct.title + " just went out of stock! Better Luck next time.");
                                }
                                foundCartProduct.save();
                            } else if (foundCart.size == "Medium") {
                                foundCartProduct.sizeMD = foundCartProduct.sizeMD - foundCart.amount;
                                foundCartProduct.save();
                            } else if (foundCart.size == "Large") {
                                foundCartProduct.sizeLG = foundCartProduct.sizeLG - foundCart.amount;
                                foundCartProduct.save();
                            } else if (foundCart.size == "Extra Large") {
                                foundCartProduct.sizeXL = foundCartProduct.sizeXL - foundCart.amount;
                                foundCartProduct.save();
                            }
                        })
                    }
                })
                console.log("REMOVING: " + cartInfo[0]);
                res.locals.currentUser.cart.remove({ _id: cartInfo[0] });
            }
            res.locals.currentUser.save();
        }
    });
    req.flash("success", "Your order has been placed! We would contact you when its ready.");
    res.redirect("/user/" + res.locals.currentUser._id);
});

router.get("/cart/change/:id", function (req, res) {

    cartItem.findById(req.params.id, function (err, foundCartItem) {
        if (err) {
            console("ERR updating CART ITEM :  " + err);
        } else {
            res.locals.currentUser.cart.remove({ _id: req.params.id });
            res.locals.currentUser.save();
            foundCartItem.remove();
            req.flash("secondary", "Item removed from cart, your previous selection was: " + foundCartItem.productName + " size: " + foundCartItem.size + ". Total of: " + foundCartItem.amount + " items.");
            res.redirect("/products/" + foundCartItem.id);
        }
    });

})

router.delete("/cart/:id", function (req, res) {
    //res.send("The user is: " + res.locals.currentUser + "The users cart contains: " +  res.locals.currentUser.cart + "item id: " + req.params.id);
    cartItem.findById(req.params.id, function (err, foundCartItem) {
        if (err) {
            console("ERR DELETEING CART ITEM :  " + err);
            req.flash("error", "Couldnt delete cart item");
        } else {
            res.locals.currentUser.cart.remove({ _id: req.params.id });
            res.locals.currentUser.save();
            foundCartItem.remove();
            req.flash("success", "Item has been removed.");

        }
    });

    res.redirect("back");
})


//Creating new order
router.put("/confirm/:id", isAdmin, function (req, res) {
    let update = { delivered: true };
    order.findByIdAndUpdate(req.params.id, update, function (err, foundOrder) {
        if (err) {
            console.log("Couldnt Update");
        } else {
            req.flash("success", "Order has been confirmed");
            res.redirect("/admin");
        }
    })
});



//Delete order
router.delete("/delete/:id", isAdmin, function (req, res) {
    order.findById(req.params.id, function (err, foundOrder) {
        if (err) {
            console.log("Couldnt Update");
        } else {
            foundOrder.remove();
            req.flash("success", "Order has been removed.");
            res.redirect("back");
        }
    })
});

//Rendering order edit page
router.get("/edit/:id", isAdmin, function (req, res) {
    order.findById(req.params.id).populate("cart buyer").exec(function (err, foundOrder) {
        if (err) {
            console.log("Couldnt find order");
            req.flash("error", "Couldnt find order.");
        } else {
            console.log(foundOrder);
            res.render("orderEdit", { order: foundOrder });
        }
    })
});

//changing the cart
router.put("/edit/cart/:id", isAdmin, function (req, res) {
    //FInd the product which we would update then refill the inventory with the previous product then reduce with the new size n amount
    cartItem.findById(req.params.id, function (err, foundCart) {
        if (err) {
            req.flash("error", "Couldnt find cart item.");
        } else {
            //keeps track if the change is valid or not
            let approve = false;
            //refilling the inventory
            product.findById(foundCart.id, function (err2, foundCartProduct) {

                if (err) {
                    console.log("Couldnt find product. " + err2);
                } else {
                    if (foundCart.size == "Small") {
                        foundCartProduct.sizeSM = foundCartProduct.sizeSM + foundCart.amount;
                        foundCartProduct.save();
                    } else if (foundCart.size == "Medium") {
                        foundCartProduct.sizeMD = foundCartProduct.sizeMD + foundCart.amount;
                        foundCartProduct.save();
                    } else if (foundCart.size == "Large") {
                        foundCartProduct.sizeLG = foundCartProduct.sizeLG + foundCart.amount;
                        foundCartProduct.save();
                    } else if (foundCart.size == "Extra Large") {
                        foundCartProduct.sizeXL = foundCartProduct.sizeXL + foundCart.amount;
                        foundCartProduct.save();
                    }
                }
                if (req.body.cart.size == "Small") {
                    foundCartProduct.sizeSM = foundCartProduct.sizeSM - req.body.cart.amount;
                    if (foundCartProduct.sizeSM >= 0) {
                        foundCartProduct.save();
                        approve = true;
                    }

                } else if (req.body.cart.size == "Medium") {
                    foundCartProduct.sizeMD = foundCartProduct.sizeMD - req.body.cart.amount;
                    if (foundCartProduct.sizeMD >= 0) {
                        foundCartProduct.save();
                        approve = true;
                    }

                } else if (req.body.cart.size == "Large") {
                    foundCartProduct.sizeLG = foundCartProduct.sizeLG - req.body.cart.amount;
                    if (foundCartProduct.sizeLG >= 0) {
                        foundCartProduct.save();
                        approve = true;
                    }

                } else if (req.body.cart.size == "Extra Large") {
                    foundCartProduct.sizeXL = foundCartProduct.sizeXL - req.body.cart.amount;
                    if (foundCartProduct.sizeXL >= 0) {
                        foundCartProduct.save();
                        approve = true;
                    }

                }
                //Updating the cart with changed item
                if (approve) {
                    cartItem.findByIdAndUpdate(req.params.id, req.body.cart, function (err, updatedCart) {
                        if (err) {
                            console.log("Couldnt Update Cart " + err);
                        } else {
                            req.flash("success", "cart item updated");
                            res.redirect("back");
                        }
                    })
                }
            })

        }
    });



})


//Adding products to cart
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
                                        console.log("USER Looks like this now: " + saveduser);
                                        req.flash("success", "Item added to cart.");
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
        if (req.user.admin === true) {
            return next();
        } else {
            console.log("PERSON IS NOT ADMIN******************")
            res.send("ONLY FOR ADMIN");
        }
    } else {
        res.redirect("/login");
    }
}
module.exports = router;

