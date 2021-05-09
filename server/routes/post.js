const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Post = mongoose.model("Post");
const requireLogin = require("../middleware/requireLogin");

//get all post
router.get("/allpost", requireLogin, (req, res) => {
  // get all the post
  Post.find()
    // get the id and the name only
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id name")
    .then((posts) => {
      res.json({ posts: posts });
    })
    .catch((err) => {
      console.log(err);
    });
});

// get only the post for tha user
router.get("/mypost", requireLogin, (req, res) => {
  Post.find({ postedBy: req.user._id })
    .populate("postedBy", "_id name")
    .then((mypost) => {
      res.json({ mypost: mypost });
    })
    .catch((err) => {
      consoel.log(err);
    });
});

//create a post
router.post("/createpost", requireLogin, (req, res) => {
  const { title, body, photo } = req.body;
  if (!title || !body || !photo) {
    res.status(422).json({ error: "Please add all the required fields" });
  }
  //   console.log(req.user);
  //   res.send("ok");
  // not show the passwor din out data
  req.user.password = undefined;

  const post = new Post({
    title: title,
    body: body,
    photo: photo,
    postedBy: req.user,
  });
  post
    .save()
    .then((results) => {
      res.json({ post: results });
    })
    .catch((err) => {
      console.log(err);
    });
});

// like and unlike post
router.put("/like", requireLogin, (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { likes: req.user._id },
    },
    {
      new: true,
    }
  ).exec((err, result) => {
    if (err) {
      return res.status(422).json({ error: err });
    } else {
      res.json(result);
    }
  });
});

router.put("/unlike", requireLogin, (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $pull: { likes: req.user._id },
    },
    {
      new: true,
    }
  ).exec((err, result) => {
    if (err) {
      return res.status(422).json({ error: err });
    } else {
      res.json(result);
    }
  });
});

router.put("/comment", requireLogin, (req, res) => {
  // getting the the comments and details of the user
  const comment = {
    text: req.body.text,
    postedBy: req.user._id,
  };

  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { comments: comment },
    },
    {
      new: true,
    }
  )
    // populate the name
    .populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id name")
    .exec((err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      } else {
        res.json(result);
      }
    });
});

router.delete("/deletepost/:postId", requireLogin, (req, res) => {
  Post.findOne({ _id: req.params.postId })
    .populate("postedBy", "_id")
    .exec((err, post) => {
      if (err || !post) {
        return res.status(422).json({ error: err });
      }
      if (post.postedBy._id.toString() === req.user._id.toString()) {
        post
          .remove()
          .then((result) => {
            res.json({ result });
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
});

module.exports = router;
