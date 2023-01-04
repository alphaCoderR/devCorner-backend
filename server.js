const express = require("express");
const connectDb = require("./config/db");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
// This removes the necessity for using bodyParser

// Connecting to the mongoDb database
connectDb();

// Defining Routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/posts", require("./routes/api/posts"));

// Serving static assets in production
if (process.env.NODE_ENV === "production") {
  
  //Setting up the static folder
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server is online at port ${PORT}`);
});
