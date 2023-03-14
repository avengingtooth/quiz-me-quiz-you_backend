const express = require("express")
const router = require("express").Router();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../models/User.model");
const isAuthenticated = require("../middleware/isAuthenticated");

const jsonWebToken = require("jsonwebtoken")

router.post("/login", (req, res, next) => {
  const { username, password } = req.body;

  // Check that username, email, and password are provided
  if (username === "" || password === "") {
    res.status(400).json({
      errorMessage:
        "All fields are mandatory. Please provide username and password.",
    });

    return;
  }

  // Search the database for a user with the email submitted in the form
  User.findOne({ username })
    .then((user) => {
      // If the user isn't found, send an error message that user provided wrong credentials
      if (!user) {
        res
          .status(400)
          .json({ errorMessage: "Wrong credentials." });
        return;
      }

      // If user is found based on the username, check if the in putted password matches the one saved in the database
      bcrypt
        .compare(password, user.password)
        .then((isSamePassword) => {
          if (!isSamePassword) {
            res
              .status(400)
              .json({ errorMessage: "Wrong credentials." });
            return;
          }

          const token = jsonWebToken.sign(
            { id: user._id },
            process.env.TOKEN_SECRET,
            {
              algorithm: 'HS256',
              expiresIn: '1d',
            }
          )
          res.json({authToken: token})
          // req.session.currentUser = user.toObject();
          // delete req.session.currentUser.password;
        })
        .catch((err) => next(err)); // In this case, we send error handling to the error handling middleware.
    })
    .catch((err) => next(err));
});


router.post("/signup", (req, res, next) => {
  const { username, password } = req.body;

  // Check that username, email, and password are provided
  if (username === "" || password === "") {
    res.status(400).json({
      errorMessage:
        "All fields are mandatory. Please provide your username, email and password.",
    });

    return;
  }

  const saltRounds = 10

  bcrypt
    .genSalt(saltRounds)
    .then((salt) => bcrypt.hash(password, salt))
    .then((hashedPassword) => {

      // Create a user and save it in the database
      return User.create({ username, password: hashedPassword });
    })
    .then((user) => {
      res.status(201).json({ message: "User Created" });
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(500).json({ errorMessage: error.message });
      } else if (error.code === 11000) {
        res.status(500).json({
          errorMessage:
            "Username need to be unique. Provide a valid username",
        });
      } else {
        next(error);
      }
    });
});

router.get("/verify", isAuthenticated, async (req, res, next) => {
  res.json(req.user)
})

module.exports = router;