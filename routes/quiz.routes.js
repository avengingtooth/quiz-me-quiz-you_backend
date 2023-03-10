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

router.get('/getId/:quizId', async (req, res, next) => {   
    let { quizId } = req.params
    let quiz = await Quiz.findById(quizId).populate('questions')
    res.json({quiz})
})

router.get("/get/:count", async (req, res, next) => {
    let { count } = req.params
    let quizzes = await Quiz.find().limit(count)
    console.log('many', quizzes[0])
    res.json({quizzes: quizzes})
})
router.post('/delete'), (req, res, next) => {
    res.json('deleted')
}

router.post('/edit'), (req, res, next) => {
    res.json('edit')
}

module.exports = router;
