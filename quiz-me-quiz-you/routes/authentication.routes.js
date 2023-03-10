const express = require("express")
const router = require("express").Router();
const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");

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
                "All fields are mandatory. Please provide username, email and password.",
        });

        return;
    }

    // - either length based parameters or we check the strength of a password
    if (password.length < 6) {
        return res.status(400).json("login", {
            errorMessage: "Your password needs to be at least 6 characters long.",
        });
    }

    // Search the database for a user with the email submitted in the form
    User.findOne({ username })
        .then((user) => {
            // If the user isn't found, send an error message that user provided wrong credentials
            if (!user) {
                res
                    .status(400)
                    .json("login", { errorMessage: "User not found." });
                return;
            }

            const passwordCorrect = bcrypt.compareSync(password, user.password);

            if (passwordCorrect) {
                // Deconstruct the user object to omit the password
                const { _id, username } = foundUser;

                // Create an object that will be set as the token payload
                const payload = { _id, username };

                // Create and sign the token
                const authToken = jwt.sign(
                    payload,
                    process.env.TOKEN_SECRET,
                    { algorithm: 'HS256', expiresIn: "6h" }
                );

                // Send the token as the response
                res.status(200).json({ authToken: authToken });
            }
            else {
                res.status(401).json({ message: "Unable to authenticate the user" });
            }

        })
        .catch(err => res.status(500).json({ message: "Internal Server Error" }));
});



router.get("/signup", isLoggedOut, (req, res) => {
    res.json("signup");
});
router.post("/signup", isLoggedOut, (req, res, next) => {
    const { username, confirmPassword, password } = req.body;

    // Check that username, email, and password are provided
    if (username === "" || confirmPassword === "" || password === "") {
        res.status(400).json("signup", {
            errorMessage:
                "All fields are mandatory. Please provide your username, email and password.",
        });

        return;
    }



    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!passwordRegex.test(password)) {
        res.status(400).json({ message: 'Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.' });
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
        .then((createdUser) => {
            const { name, _id } = createdUser;
            const user = { name, _id };

            // Send a json response containing the user object
            res.status(201).json({ user: user });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ message: "Internal Server Error" })
        })
    next(error);
}
);



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
