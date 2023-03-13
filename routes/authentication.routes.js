const express = require("express")
const router = require("express").Router();

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const User = require("../models/User.model");

const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");


router.get("/login", isLoggedOut, (req, res) => {
  res.json("login");
});
router.post("/login", (req, res, next) => {
  const { username, password } = req.body;

  // Check that username, email, and password are provided
  if (username === "" || password === "") {
    res.status(400).json("login", {
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
          .json("login", { errorMessage: "Wrong credentials." });
        return;
      }

      // If user is found based on the username, check if the in putted password matches the one saved in the database
      bcrypt
        .compare(password, user.password)
        .then((isSamePassword) => {
          if (!isSamePassword) {
            res
              .status(400)
              .json("login", { errorMessage: "Wrong credentials." });
            return;
          }

          // Add the user object to the session object
          req.session.currentUser = user.toObject();
          // Remove the password field
          delete req.session.currentUser.password;

          res.redirect("/quiz/all");
        })
        .catch((err) => next(err)); // In this case, we send error handling to the error handling middleware.
    })
    .catch((err) => next(err));
});



router.get("/signup", isLoggedOut, (req, res) => {
  res.json("signup");
});
router.post("/signup", isLoggedOut, (req, res, next) => {
  const { username, password } = req.body;

  // Check that username, email, and password are provided
  if (username === "" || password === "") {
    res.status(400).json("signup", {
      errorMessage:
        "All fields are mandatory. Please provide your username, email and password.",
    });

    return;
  }

  bcrypt
    .genSalt(saltRounds)
    .then((salt) => bcrypt.hash(password, salt))
    .then((hashedPassword) => {

      // Create a user and save it in the database
      return User.create({ username, password: hashedPassword });
    })
    .then((user) => {
      res.redirect("/login");
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(500).json("signup", { errorMessage: error.message });
      } else if (error.code === 11000) {
        res.status(500).json("signup", {
          errorMessage:
            "Username need to be unique. Provide a valid username",
        });
      } else {
        next(error);
      }
    });
});



router.post("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json("logout", { errorMessage: err.message });
      return;
    }

    res.redirect("/");
  });
});



module.exports = router;