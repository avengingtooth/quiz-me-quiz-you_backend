const router = require("express").Router();

const Quiz = require('../models/Quiz-model')
const Questions = require('../models/Question-model')
const User = require('../models/User.model')

router.post("/create", async (req, res, next) => {
    try{
        let {quiz} = req.body
        let questionObjIds = []
        for (curQuestions of quiz.questions){
            questionObjIds.push(await Questions.create(curQuestions))
        }
        quiz.owner = await User.findOne({username: quiz.owner})
        quiz.questions = questionObjIds
        await Quiz.create(quiz)
        res.json("create")
    }
    catch (error){
        next(error)
    }
});

router.get("/get", async (req, res, next) => {
    let {startInd, count} = req.body
    let quizzes = await Quiz.find().limit(count + startInd)
    res.json({quizzes: quizzes})
})

router.post('/:id/delete'), (req, res, next) => {
    res.json('deleted')
}

router.post('/:id/edit'), (req, res, next) => {
    res.json('edit')
}

module.exports = router;
