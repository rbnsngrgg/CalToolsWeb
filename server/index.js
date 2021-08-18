require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./server");
const PORT = process.env.PORT || 3001;

mongoose.connect("mongodb://localhost:27017/CalToolsDb", { useNewUrlParser: true , useUnifiedTopology: true, useCreateIndex: true})
  .then(async () => {
    //Initialize database collections on server start
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
});
