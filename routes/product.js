var express = require("express");
var router = express.Router();
var product = require("../models/product");


//SHOWS ALL MALE PRODUCTS
router.get("/male", function (req, res) {
    //get all campgrounds
    product.find({ sex: "Male" }, function (err, allProducts) {
        if (err) {
            console.log(err);
        } else {
            res.render("productMale", { maleProducts: allProducts });
        }
    })
});


//SHOWS ALL FEMALE PRODUCTS
router.get("/female", function (req, res) {
    //get all campgrounds
    product.find({ sex: "Female" }, function (err, allProducts) {
        if (err) {
            console.log(err);
        } else {
            res.render("productFemale", { femaleProducts: allProducts });
        }
    })
});

//
router.post("/new", isAdmin, function (req, res) {
    //create new campground and save
    product.create(req.body.product, function (err, newProduct) {
        if (err) {
            console.log(err);
        } else {
            //redirect back to /campgrounds
            res.redirect("back");
        }
    })

});

//NEW PRODUCT CREATE ROUTE
router.get("/new", isAdmin, function (req, res) {
    res.render("productAdd");
});


//INDIVIUAL PAGE ROUTE 
router.get("/:id", function (req, res) {

    product.findById(req.params.id, function (err1, foundProduct) {

        if (err1) {
            console.log(err1);
        } else {
            if (foundProduct.sex == "Male") {

                product.find({ sex: "Male" }, function (err2, allMaleProducts) {
                    res.render("productSingleMale", { product: foundProduct, allProducts: allMaleProducts });
                });
            }
            else if (foundProduct.sex == "Female") {

                product.find({ sex: "Female" }, function (err2, allFemaleProducts) {
                    res.render("productSingleFemale", { product: foundProduct, allProducts: allFemaleProducts });
                });

            } else {
                res.send("No such product exists");
            }

        }
    });


});




//PRODUCT DELETE ROUTE
router.put("/:id", isAdmin, function (req, res) {
    product.findByIdAndUpdate(req.params.id, req.body.product, function (err, updatedProduct) {
        if (err) {
            console.log(err);
        } else {
            console.log(updatedProduct);
            // req.flash("success", "Campground updated!");
            res.redirect("/products/" + req.params.id);
        }
        // req.flash("success", "Logged you out");
    });
});

//NEW PRODUCT CREATE ROUTE
router.get("/:id/edit", isAdmin, function (req, res) {
    product.findById(req.params.id, function (err, foundProduct) {
        res.render("editProduct", { product: foundProduct });
    });
});

//PRODUCT DELETE ROUTE
router.delete("/:id", isAdmin, function (req, res) {
    product.findById(req.params.id, function (err, foundProduct) {
        if (err) {
            console.log("Removed");
        } else {
            console.log("Removed");
            foundProduct.remove();
        }

        // req.flash("success", "Logged you out");
        res.redirect("/admin/products");
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