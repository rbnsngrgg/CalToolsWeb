require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./server");
const PORT = process.env.PORT || 3000;
const dbUrl = process.env.MONGO_DB_CONNECTION_STRING;

mongoose.connect(dbUrl, { useNewUrlParser: true , useUnifiedTopology: true, useCreateIndex: true})
  .then(async () => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
});
