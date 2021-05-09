const express = require("express");
const app = express();
const PORT = 1111;
const mongoose = require("mongoose");
const { MONGOURI } = require("./keys");

const cors = require("cors");
app.use(cors());

// user
require("./models/user");
// post
require("./models/post");


// connect mongodb
mongoose.connect(MONGOURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("connected", () => {
  console.log("connected to mongodb ");
});
mongoose.connection.on("error", (error) => {
  console.log("error connecting", error);
});

// pass all incoming request
app.use(express.json());
app.use(require("./routes/auth"));
app.use(require("./routes/post"));
app.use(require("./routes/user"));

const customeMiddleware = (req, res, next) => {
  console.log("middleware executed!");
  next();
};

app.get("/", (req, res) => {
  console.log("home");
  res.send("hello user");
});

app.get("/about", customeMiddleware, (req, res) => {
  console.log("about");
  res.send("about page");
});

app.listen(PORT, () => {
  console.log("server is running ");
});

// quickSahre123
// mongodb+srv://quickSahre:<password>@cluster0.xn8nu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
