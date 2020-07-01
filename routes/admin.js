var express     = require("express");
var router      = express.Router();
var product     = require("../models/product");
var user        = require("../models/user");


//One route handles all
router.get("/", isAdmin, function (req, res) {
    //get all campgrounds
    product.find({}, function (err, allProducts) {
        if(err){
            console.log("ERR WITH GETING PRODUCTS: " + ERR);
        }else{
            user.find({},function(err, allUser){
                if(err){
                    console.log("ERR WITH GETING PRODUCTS: " + ERR);
                }else{
                    res.render("admin", { products: allProducts, users: allUser })
                }

            })  
    
        }
       
    })
});

// //SHOWS ALL  PRODUCTS
// router.get("/products", isAdmin, function (req, res) {
//     //get all campgrounds
//     product.find({}, function (err, allProducts) {
//         if (err) {
//             console.log(err);
//         } else {
//             res.render("allProduct", { products: allProducts});
//         }
//     })
// });

// //SHOWS ALL  users
// router.get("/users", isAdmin, function (req, res) {
//     //get all campgrounds
//     user.find({}, function (err, allUser) {
//         if (err) {
//             console.log(err);
//         } else {
//             res.render("allUsers", { users: allUser});
//         }
//     })
// });

//ADMIN CHECKING MIDDLEWARE
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