const express = require("express");
const router = express.Router();
const config = require("config");
const gravatar = require("gravatar");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

/*******************************************************
   Route :          "api/users"
   Description :    "Post request for registering a user"
   Access :         "Public"
*******************************************************/

// Including db Models
const userModel = require("../../models/User");

router.post(
  "/",
  /****  Using Express Validator to validate the inputs ****/
  body("name", "Name is required").not().isEmpty(),
  body("email", "Email is required").isEmail(),
  body("password", "Set a valid password").isLength({ min: 8 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      let { name, email, password } = req.body;
      try {
        // Checking if the User already exists in db
        await userModel.findOne({ email: email }, (err, data) => {
          if (!err && data != null) {
            return res
              .status(400)
              .json({ errors: [{ msg: "The user is already registed" }] });
          }
        });

        /****  Getting user gravatar ****/
        const avatar = await gravatar.url(email, { s: 200, r: "pg", d: "mm" });

        // Creating object model for the new user
        let newUser = new userModel({
          name: name,
          email: email,
          password: password,
          avatar: avatar,
        });

        /****  Encrypting the password ****/
        const saltRounds = 10;
        await bcrypt.hash(password, saltRounds, (err, hash) => {
          if (!err) {
            newUser.password = hash;
            newUser.save(); // Saving the new user using the encrypted password
          }
        });

        /****  Implementing Json Web Tokens ****/
        const payload = {
          id: newUser.id,
          auth: true,
        };

        jwt.sign(
          payload,
          config.get("jwtSecret"),
          { expiresIn: 360000 },
          (err, token) => {
            if (!err) {
              res.json({ token });
            }
          }
        );
      } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
      }
    }
  }
);

module.exports = router;
