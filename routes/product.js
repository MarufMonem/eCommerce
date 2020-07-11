var express = require("express");
var router = express.Router();
var product = require("../models/product");
var user = require("../models/user");


//SHOWS ALL MALE PRODUCTS
router.get("/male", function (req, res) {
    product.find({ sex: "Male" }, function (err, allProducts) {
        if (err) {
            console.log(err);
        } else {

            if (res.locals.currentUser) {
                user.findById(res.locals.currentUser._id).populate("cart").exec(function (err, foundUser) {
                    res.render("productMale", { user: foundUser, maleProducts: allProducts });
                })
            } else {

                res.render("productMale", { maleProducts: allProducts });
            }
        }
    })
});

//SHOWS ALL FEMALE PRODUCTS
router.get("/female", function (req, res) {
    product.find({ sex: "Female" }, function (err, allProducts) {
        if (err) {
            console.log(err);
        } else {
            if (res.locals.currentUser) {
                user.findById(res.locals.currentUser._id).populate("cart").exec(function (err, foundUser) {
                    res.render("productFemale", { user: foundUser, femaleProducts: allProducts });
                })
            } else {
                res.render("productFemale", { femaleProducts: allProducts });
            }
        }
    })
});

//Addubg new product 
router.post("/new", isAdmin, function (req, res) {

    console.log("The product request image looks like: " + req.body.product.image);
    var productInfo = {
        title:      req.body.product.title,
        price:      req.body.product.price,
        sex:        req.body.product.sex,
        description:req.body.product.description,
        featured:   req.body.product.featured,
        sizeXL:     req.body.product.sizeXL,
        sizeLG:     req.body.product.sizeLG,
        sizeMD:     req.body.product.sizeMD,
        sizeSM:     req.body.product.sizeSM,
        image:      []
    }
    var imagesArray = req.body.product.image;
    //create new product and save
    product.create(productInfo, function (err, newProduct) {
        if (err) {
            console.log(err);
        } else {
            imagesArray.forEach(function (imageUrl) {
                if (!imageUrl == "") {
                    newProduct.image.push(imageUrl);
                }
            });
            newProduct.save(function (err, savedProduct) {
                if (err) {
                    console.log(err);
                } else {
                    req.flash("success","Product created.");
                    res.redirect("back");
                }
            })
        }
    })
});

//INDIVIUAL PAGE ROUTE 
router.get("/:id", function (req, res) {
    product.findById(req.params.id, function (err1, foundProduct) {
        if (err1) {
            console.log(err1);
        } else {
            if (foundProduct.sex == "Male") {
                product.find({ sex: "Male" }, function (err2, allMaleProducts) {
                    if (res.locals.currentUser) {
                        user.findById(res.locals.currentUser._id).populate("cart").exec(function (err, foundUser) {
                            res.render("productSingleMale", { user: foundUser, product: foundProduct, allProducts: allMaleProducts });
                        })
                    } else {
                        res.render("productSingleMale", { product: foundProduct, allProducts: allMaleProducts });
                    }
                });
            }
            else if (foundProduct.sex == "Female") {
                product.find({ sex: "Female" }, function (err2, allFemaleProducts) {
                    if (res.locals.currentUser) {
                        user.findById(res.locals.currentUser._id).populate("cart").exec(function (err, foundUser) {
                            res.render("productSingleFemale", { user: foundUser, product: foundProduct, allProducts: allFemaleProducts });
                        })
                    } else {
                        res.render("productSingleFemale", { product: foundProduct, allProducts: allFemaleProducts });
                    }
                });
            } else {
                res.send("No such product exists");
            }
        }
    });
});

//PRODUCT UPDATE ROUTE
router.put("/:id", isAdmin, function (req, res) {

    var productInfo = {
        title:          req.body.product.title,
        price:          req.body.product.price,
        sex:            req.body.product.sex,
        description:    req.body.product.description,
        featured:       req.body.product.featured,
        sizeXL:         req.body.product.sizeXL,
        sizeLG:         req.body.product.sizeLG,
        sizeMD:         req.body.product.sizeMD,
        sizeSM:         req.body.product.sizeSM,
        image: []
    }
//empty image array becuase we would put new values everytime or else array values stay
    var imagesArray = req.body.product.image;
    product.findByIdAndUpdate(req.params.id, productInfo, function (err, updatedProduct) {
        if (err) {
            console.log(err);
        } else {
            imagesArray.forEach(function (imageUrl) {
                if (!imageUrl == "") {
                    updatedProduct.image.push(imageUrl);
                }
            });
            updatedProduct.save();
            req.flash("success","Product has been updated.");
            res.redirect("/products/" + req.params.id);
        }
    });
});

//NEW PRODUCT CREATE FORM ROUTE
router.get("/:id/edit", isAdmin, function (req, res) {
    product.findById(req.params.id, function (err, foundProduct) {
        res.render("editProduct", { product: foundProduct });
    });
});

//PRODUCT DELETE ROUTE
router.delete("/:id", isAdmin, function (req, res) {
    product.findById(req.params.id, function (err, foundProduct) {
        if (err) {
            req.flash("error","Couldnt remove product " + err);
        } else {
            req.flash("success","Product has been removed.");
            foundProduct.remove();
        }
        res.redirect("/admin");
    });
});


// ************MIDDLE WARE***************

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
        if (req.user.admin === true) {
            console.log("PERSON IS ADMIN******************")
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