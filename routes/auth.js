const router = require("express").Router();
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (username !== "ColanInfotech") {
      return res.status(401).json("Incorrect UserName");
    }
    const correctPassword = "admin";

    if (password !== correctPassword) {
      return res.status(401).json("Incorrect Password");
    }
    const accessToken = jwt.sign(
      {
        username: "ColanInfotech",
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "2d",
      }
    );
    res.status(200).json({ username: "ColanInfotech", accessToken });
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

module.exports = router;
