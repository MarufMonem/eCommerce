var express     = require("express");
var router      = express.Router();
var passport    = require("passport");
var user        = require("../models/user");

// ROOT PATH
router.get("/", function (req, res) {
    res.render("index");
});

module.exports = router;