const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { body, validationResult } = require("express-validator");

//Including mongoose model
const userModel = require("../../models/User");
const profileModel = require("../../models/Profile");
const postModel = require("../../models/Post");

/*******************************************************
   Route :          "api/posts/newPost"
   Description :    "Adding a post"
   Access :         "Private"
*******************************************************/

router.post(
  "/newPost",
  [
    auth,
    body("head", "Enter the heading for your post").not().isEmpty(),
    body("body", "Write a post").not().isEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      } else {
        let User = await userModel.findById(req.user.id);
        const newPost = new postModel({
          head: req.body.head,
          body: req.body.body,
          name: User.name,
          avatar: User.avatar,
          user: req.user.id,
        });

        await newPost.save();
        res.send(newPost);
      }
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server Error");
    }
  }
);

/*******************************************************
   Route :          "api/posts/"
   Description :    "Displaying all post"
   Access :         "Private"
*******************************************************/

router.get("/", async (req, res) => {
  try {
    let posts = await postModel
      .find()
      .select(["-date", "-__v"])
      .sort({ date: -1 }); // Sorts the results in ascending manner
    res.json(posts);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});

/*******************************************************
   Route :          "api/posts/:postId"
   Description :    "Fetching a post"
   Access :         "Private"
*******************************************************/

router.get("/:postId", auth, async (req, res) => {
  try {
    let post = await postModel.findById(req.params.postId);
    if (!post) {
      res.status(404).send("Post doesn't exists");
    }
    res.send(post);
  } catch (err) {
    console.log(err.message);
    if (err.kind === "ObjectId") {
      res.status(404).send("Post doesn't exists");
    }

    res.status(500).send("Server Error");
  }
});

/*******************************************************
   Route :          "api/posts/del/:postId"
   Description :    "Deleting a post"
   Access :         "Private"
*******************************************************/

router.delete("/del/:postId", auth, async (req, res) => {
  try {
    let post = await postModel.findById(req.params.postId);
    if (!post) {
      res.status(404).send("Post doesn't exists");
    }
    if (post.user.toString() === req.user.id) {
      await post.remove(); // Deletes the post
      res.send(await postModel.find());
    } else {
      res.status(401).send("Unauthorized");
    }
  } catch (err) {
    console.log(err.message);
    if (err.kind === "ObjectId") {
      res.status(404).send("Post doesn't exists");
    }

    res.status(500).send("Server Error");
  }
});

/*******************************************************
   Route :          "api/posts/like/:postId"
   Description :    "Liking or removing a like from a post"
   Access :         "Private"
*******************************************************/

router.put("/like/:postId", auth, async (req, res) => {
  try {
    let post = await postModel.findById(req.params.postId);
    let likeCounter = post.likes.filter(
      (ele) => ele._id.toString() === req.user.id
    );
    let dislikeCounter = post.dislikes.filter(
      (ele) => ele._id.toString() === req.user.id
    );

    // When there is no dislike & like from the same user
    if (likeCounter.length == 0 && dislikeCounter.length == 0) {
      post.likes.unshift(req.user.id);
      await post.save();
    }

    // When the user has already liked this post and this request removes his like from the post
    if (likeCounter.length != 0) {
      let removeLike = await post.likes.indexOf(likeCounter[0]);
      post.likes.splice(removeLike, 1);
      await post.save();
    }

    // When there is a dislike then the dislike is removed first & then it is liked
    if (dislikeCounter.length != 0) {
      let removeDislike = await post.dislikes.indexOf(dislikeCounter[0]);
      post.dislikes.splice(removeDislike, 1);
      post.likes.unshift(req.user.id);
      await post.save();
    }
    res.send(post.likes);
  } catch (err) {
    console.log(err.message);
    if (err.kind === "ObjectId") {
      res.status(404).send("Post doesn't exists");
    }
    res.status(500).send("Server Error");
  }
});

/*******************************************************
   Route :          "api/posts/dislike/:postId"
   Description :    "Disliking or removing a dislike from a post"
   Access :         "Private"
*******************************************************/

router.put("/dislike/:postId", auth, async (req, res) => {
  try {
    let post = await postModel.findById(req.params.postId);
    let likeCounter = post.likes.filter(
      (ele) => ele._id.toString() === req.user.id
    );
    let dislikeCounter = post.dislikes.filter(
      (ele) => ele._id.toString() === req.user.id
    );
    if (likeCounter.length == 0 && dislikeCounter.length == 0) {
      post.dislikes.unshift(req.user.id);
      await post.save();
    }
    if (likeCounter.length != 0) {
      let removeLike = await post.likes.indexOf(likeCounter[0]);
      post.likes.splice(removeLike, 1);
      post.dislikes.unshift(req.user.id);
      await post.save();
    }
    if (dislikeCounter.length != 0) {
      let removeDislike = await post.dislikes.indexOf(dislikeCounter[0]);
      post.dislikes.splice(removeDislike, 1);
      await post.save();
    }
    res.send(post.dislikes);
  } catch (err) {
    console.log(err.message);
    if (err.kind === "ObjectId") {
      res.status(404).send("Post doesn't exists");
    }
    res.status(500).send("Server Error");
  }
});

/*******************************************************
   Route :          "api/posts/comment/:postId"
   Description :    "Adding comments for a post"
   Access :         "Private"
*******************************************************/

router.post(
  "/comment/:postId",
  [auth, body("body", "Write a post").not().isEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      } else {
        let User = await userModel.findById(req.user.id);
        let Post = await postModel.findById(req.params.postId);
        const newComment = {
          body: req.body.body,
          name: User.name,
          avatar: User.avatar,
          user: req.user.id,
        };

        await Post.comments.unshift(newComment);

        await Post.save();
        res.send(Post.comments);
      }
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server Error");
    }
  }
);

/*******************************************************
   Route :          "api/posts/comment/del/:postId/:commentId"
   Description :    "Deleting comments for a post"
   Access :         "Private"
*******************************************************/

router.delete("/comment/del/:postId/:commentId", auth, async (req, res) => {
  try {
    let post = await postModel.findById(req.params.postId);

    const comment = post.comments.find(
      //Method for finding something from an array
      (comment) => comment._id.toString() === req.params.commentId
    );
    if (!comment) {
      res.send("Comment doesn't exists");
    }
    if (comment.user.toString() !== req.user.id) {
      res.status(401).send("Unauthorized");
    }

    const removeIndex = post.comments
      .map((ele) => ele.user.toString())
      .indexOf(req.user.id);
    post.comments.splice(removeIndex, 1);
    await post.save();
    res.send(post.comments);
  } catch (err) {
    console.log(err.message);
    if (err.kind === "ObjectId") {
      res.status(404).send("Post doesn't exists");
    }
    res.status(500).send("Server Error");
  }
});

module.exports = router;
