const express = require("express");
const router = express.Router();
const middleWare = require("../../middleware/auth");
const userModel = require("../../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { body, validationResult } = require("express-validator");

/*******************************************************
   Route :          "api/auth"
   Description :    "Authentication"
   Access :         "Private"
*******************************************************/

router.get("/", middleWare, async (req, res) => {
  const data = await userModel.findById(req.user.id).select("-password");
  res.json(data);
});

router.post(
  "/",
  /****  Using Express Validator to validate the inputs ****/
  body("email", "Email is required").isEmail(),
  body("password", "Enter password").exists(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      let { email, password } = req.body;
      try {
        // Checking the credentials of the user from the db
        await userModel.findOne({ email: email }, (err, data) => {
          if (!err) {
            // Verifying the user
            bcrypt.compare(password, data.password, (err, result) => {
              if (!err && result == true) {
                /****  Implementing Json Web Tokens ****/
                const payload = {
                  id: data.id,
                  auth: true,
                };
                jwt.sign(
                  payload,
                  process.env.jwtSecret,
                  { expiresIn: 360000 },
                  (err, token) => {
                    if (!err) {
                      res.json({ token });
                    }
                  }
                );
              } else {
                res.status(401).send("Unauthorized. You don't have acess");
              }
            });
          } else {
            res.status(500).send("Server Error");
          }
        });
      } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
      }
    }
  }
);

module.exports = router;
