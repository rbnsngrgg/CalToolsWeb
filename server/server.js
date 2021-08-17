require("dotenv").config();
const express = require("express");
const path = require("path");
const CTItem = require("./models/CTItem");
const PORT = process.env.PORT || 3001;
const app = express();

//Routes
const dataRoute = require("./routes/data")

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.resolve(__dirname, "../client/build")));
app.use("/data", dataRoute);

//Debug
app.post("/dev", async (req, res) => {
    console.log("Received POST to \"/dev\"");
    console.log(req.body)
    var item = new CTItem({
        serialNumber: req.body.serialNumber,
        model: req.body.model
    });
    await item.save((err) => {
        if(err){
            console.log(err);
            res.sendStatus(500);
        }
    });
    res.sendStatus(200);
});
//end debug

//Keep this at the bottom of the routes
app.get("/", (req, res) => {
    if(process.env.PORT) { res.sendFile(path.resolve(__dirname, "../client/build", "index.html")); }
    else { res.sendFile(path.resolve(__dirname, "../server/development", "home.html")); }
});
app.get("*", (req, res) => {
    res.redirect("/");
});


module.exports = app;