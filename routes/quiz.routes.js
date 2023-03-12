const router = require("express").Router();

const Quiz = require('../models/Quiz-model')
const Question = require('../models/Question-model')
const User = require('../models/User.model')

router.post("/create", async (req, res, next) => {
    try{
        let {quiz} = req.body
        let questionObjIds = []
        for (let j = 0; j < quiz.questions.length; j++){
            let curQuestions = quiz.questions[j]
            questionObjIds.push(await Question.create(curQuestions))
        }
        quiz.owner = await User.findOne({username: quiz.owner})
        quiz.questions = questionObjIds

        let createdQuizId = (await Quiz.create(quiz))._id
        res.json({createdId: createdQuizId})
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
    res.json({quizzes: quizzes})
})
router.post('/delete', async (req, res, next) => {
    let { quizId } = req.body
    let quiz = await Quiz.findById(quizId)
    quiz.questions.map(async (question) => {
        await Question.findByIdAndDelete(question._id.toString())
    })

    await Quiz.findByIdAndDelete(quizId)
    res.json('deleted')
})


router.post('/edit', async (req, res, next) => {
    let { updatedQuiz, quizId } = req.body
    let originalQuiz = await Quiz.findById(quizId)
    updatedQuiz.owner = originalQuiz.owner
    originalQuiz.questions.map(async (question) => {
        await Question.findByIdAndDelete(question._id.toString())
    })

    let questionObjIds = []
    for (let j = 0; j < updatedQuiz.questions.length; j++){
        let question = updatedQuiz.questions[j]
        questionObjIds.push(await Question.create({questionText: question.questionText, answers: question.answers}))
    }

    updatedQuiz.questions = questionObjIds
    await Quiz.findOneAndUpdate({_id: quizId}, updatedQuiz)
    res.json('edit')
})

module.exports = router;
