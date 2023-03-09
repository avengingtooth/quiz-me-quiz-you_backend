const router = require("express").Router();

router.post("/create", (req, res, next) => {
    console.log('create')
    res.json("create");
});

router.post('/:id/delete'), (req, res, next) => {
    res.json('deleted')
}

router.post('/:id/edit'), (req, res, next) => {
    res.json('edit')
}

module.exports = router;
