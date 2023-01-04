/* 
  A middleware function is simply a function that handles some activies or checks certain conditions
  of a request before the callback function is executed.
*/

const config = require("config");
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // Getting token from the header
  const token = req.header("auth-token");

  if (!token) {
    return res.status(401).send("Token Missing. Unauthorized Entry");
  }

  // Verifying the signature of the token
  jwt.verify(token, config.get("jwtSecret"), (err, decoded) => {
    if (err) {
      return res.status(401).send("Invalid Token. Unauthorized Entry");
    }
    req.user = decoded;  // Creating a new field "user" in our "request" so that the data can be acessed on any route
    next();              // Callback function
  });
};
