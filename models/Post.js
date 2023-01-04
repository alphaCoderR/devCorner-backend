const mongoose = require("mongoose");


const postSchema = new mongoose.Schema({
  user: {
    // This is a js object. For comparing this user field with other fiels first convert it to a string using toString() method
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Referce is given to the "User" model for population
  },
  head: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  name: String,
  avatar: String,
  likes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Referce is given to the "User" model for population
      },
    },
  ],
  dislikes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Referce is given to the "User" model for population
      },
    },
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Referce is given to the "User" model for population
      },
      body: {
        type: String,
        required: true,
      },
      name: String,
      avatar: String,
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Post", postSchema);
