const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const User = mongoose.model("User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../keys");
const requireLogin = require("../middleware/requireLogin");

router.get("/", (req, res) => {
  res.send("hello from router");
});

// signup
router.post("/signup", (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password || !name) {
    res.status(422).json({ error: "please add all the fields" });
  }
  //  res.json({ message: "successfuly posted!" });
  // send data to our data based
  User.findOne({ email: email })
    .then((savedUser) => {
      if (savedUser) {
        res.status(422).json({ error: "User already exsits with that email" });
      }
      // hide the password with bcrypt
      bcrypt.hash(password, 12).then((hashedpassword) => {
        const user = new User({
          email: email,
          name: name,
          password: hashedpassword,
        });

        user
          .save()
          .then((user) => res.json({ message: "saved successfully" }))
          .catch((err) => {
            console.log(err);
          });
      });
    })

    .catch((err) => {
      console.log(err);
    });
});


// sigin
router.post("/signin", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ error: "please provide email or password" });
  }
  User.findOne({ email: email }).then((savedUser) => {
    if (!savedUser) {
      return res.status(422).json({ error: "Invalid email or password" });
    }
    // compare password
    bcrypt
      .compare(password, savedUser.password)
      .then((doMatch) => {
        if (doMatch) {
          //   res.json({ messgae: "successfullt signed in!" });
          const token = jwt.sign(
            {
              _id: savedUser._id,
            },
            JWT_SECRET
          );
          const { _id, name, email } = savedUser;
          res.json({ token, user: { _id, name, email } });
        } else {
          return res.status(422).json({ error: "Invalid email or password" });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

module.exports = router;
