//INITIALIZE ALL THE VARIABLES
var express                 = require("express"),
    app                     = express(),
    mongoose                = require("mongoose"),
    flash                   = require("connect-flash"),
    localStrategy           = require("passport-local"),
    methodOverride          = require("method-override"),
    passport                = require("passport"),
    passportLocalMongoose   = require("passport-local-mongoose"),
    bodyParser              = require("body-parser");

// THE SCHEMAS    
var product                 = require("./models/product");
var order                   = require("./models/order");
var user                    = require("./models/user");

//THE ROUTES
var productRoutes           = require("./routes/product"),
    indexRoutes             = require("./routes/index");

mongoose.set('useUnifiedTopology', true); //removing deprication errors
mongoose.connect("mongodb://localhost/eCommerceWebsite" ,{ useNewUrlParser: true });

//MAKING ALL DIFFRENT PACKAGES AND FEATURES USEABLE IN THE APP    
app.use(bodyParser.urlencoded({ extended: true })); //get form data
app.set("view engine", "ejs"); //not write ejs every time
app.use(express.static(__dirname + "/public/stylesheets/")); //where the stulesheets are lcoated
app.use(methodOverride("_method")); //Making sure put and delete work

app.use(require("express-session")({
    //secret code to encode and decode the username and password
    //can be anything you want
    secret: "Maruf Monem E-commerce Website",
    resave: false,
    saveUninitialized:false
}));

//Making sure that express uses passport
app.use(passport.initialize()); 
app.use(passport.session());

//this line is telling passport to use the user authenticate method
//which is given to the userSchema
// passport.use(new localStrategy(user.authenticate()));


passport.use(new localStrategy({
    usernameField: 'phone', // this is where you do that
    passwordField: 'password'
},
(phone, password, done) => {
    user.findOne({
        phone: phone
    }, (error, founduser) => {
        if (error) {
            return done(error);
        }
        if (!founduser) {
            return done(null, false, {
                message: 'Username or password incorrect'
            });
        }
        // Do other validation/check if any
        return done(null, founduser);
    });
}
));



passport.serializeUser(user.serializeUser()); //encode
passport.deserializeUser(user.deserializeUser()); //decode

//middleware for pasing logged in user information.
// app.use(function(req,res,next){
//     res.locals.currentUser  = req.user;
//     res.locals.error        = req.flash("error");
//     res.locals.success      = req.flash("success");
//     next(); // for running the next part of the code
// });

//MAKING ROUTES A BIT SIMPLER TO WRITE
app.use("/",indexRoutes);
app.use("/products",productRoutes);

//middleware for pasing logged in user information.
app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    next(); // for running the next part of the code
});

app.listen(5501, "127.0.0.1", function () {
    console.log("App has started");
})