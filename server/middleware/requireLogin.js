const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { JWT_SECRET } = require("../keys");
const User = mongoose.model("User");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  //   authorization == Bearer (token)
  if (!authorization) {
    return res.status(401).json({ error: "You must be logged in!" });
  }
  const token = authorization.replace("Bearer ", "");
  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(401).json({ error: "You must be logged in" });
    }

    // distract id
    const { _id } = payload;
    console.log(payload);

    User.findById(_id).then((userdata) => {
      // req.use will have our userdata from the token
      req.user = userdata;
      next();
    });
  });
};
