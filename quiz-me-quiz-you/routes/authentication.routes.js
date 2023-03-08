const router = require("express").Router();

router.post("/login", (req, res, next) => {
    res.json("login");
});

router.post("/signup", (req, res, next) => {
    res.json("signup");
});

router.post("/logout", (req, res, next) => {
    res.json("signup");
});



module.exports = router;
