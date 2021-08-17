require("dotenv").config();
const mongoose = require("mongoose");
const CTItemSchema = require("./models/schemas/CTItemSchema");
const app = require("./server");
const PORT = process.env.PORT || 3001;

mongoose.connect("mongodb://localhost:27017/CalToolsDb", { useNewUrlParser: true , useUnifiedTopology: true, useCreateIndex: true})
  .then(async () => {
    //Initialize database collections on server start
    await mongoose.connection.createCollection("ctitems", {
      validator: {$jsonSchema: CTItemSchema}
    });
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
});
