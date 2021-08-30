require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const CTItem = require("./models/CTItem");
const passport = require("passport");
const session = require("express-session");
const PORT = process.env.PORT || 3000;

require("./strategies/JwtStrategy");
require("./strategies/LocalStrategy");
require("./strategies/GoogleStrategy");
require("./authenticate");
const userRouter = require("./routes/userRoutes");
const orgRouter = require("./routes/organizationRoutes");
const itemRouter = require("./routes/itemRoutes");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, './public')));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.resolve(__dirname, "../client/build")));

app.use(cookieParser(process.env.COOKIE_SECRET));
const whitelist = process.env.WHITELISTED_DOMAINS ? process.env.WHITELISTED_DOMAINS.split(",") : [];
const corsOptions = {
    origin: function (origin, callback) {
        if(!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else{
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
};
app.use(cors(corsOptions));

// app.use(session({
//     secret: process.env.SECRET,
//     resave: false,
//     saveUninitialized: false
// }));
app.use(passport.initialize());
//app.use(passport.session());

//Route includes
app.use("/users", userRouter);
app.use("/organizations", orgRouter);
app.use("/items", itemRouter);
// app.use("/data", dataRoute);


//Debug
// app.post("/dev", async (req, res) => {
//     console.log("Received POST to \"/dev\"");
//     console.log(req.body)
//     var item = new CTItem({
//         serialNumber: req.body.serialNumber,
//         model: req.body.model
//     });
//     await item.save((err) => {
//         if(err){
//             console.log(err);
//             res.sendStatus(500);
//         }
//     });
//     res.sendStatus(200);
// });
//end debug

app.get("/", (req, res) => {
    if(process.env.PORT) { res.sendFile(path.resolve(__dirname, "../client/build", "index.html")); }
    else { res.sendStatus(200); }
});
    
//Keep this at the bottom of the routes
app.get("*", (req, res) => {
    res.sendStatus(400);
});


module.exports = app;