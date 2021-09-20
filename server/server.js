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
const taskRouter = require("./routes/taskRoutes");
const taskDataRouter = require("./routes/taskDataRoutes");
const app = express();

//app.options('*', cors());
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

app.use(passport.initialize());

//Redirect to https
app.use((req, res, next) => {
    const host = process.env.DEBUG ? "localhost:3000" : "caltools.herokuapp.com";
    if(req.headers.host === host){
        if(!process.env.DEBUG){
            //console.log(req.headers);
            if(!req.secure){
                //console.log(`https://${req.headers.host}${req.url}`);
                return res.redirect(`https://${req.headers.host}${req.url}`);
            }
            else{ return next(); }
        }
        else{
            return next();
        }
    }
});

//Route includes
app.use("/api/users", userRouter);
app.use("/api/organizations", orgRouter);
app.use("/api/items", itemRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/taskdata", taskDataRouter);

app.get("/", (req, res) => {
    if(process.env.PORT) { res.sendFile(path.resolve(__dirname, "../client/build", "index.html")); }
    else { res.sendStatus(500); }
});
    
//Keep this at the bottom of the routes
app.get("*", (req, res) => {
    if(process.env.PORT) { res.sendFile(path.resolve(__dirname, "../client/build", "index.html")); }
    else { res.sendStatus(500); }
});


module.exports = app;