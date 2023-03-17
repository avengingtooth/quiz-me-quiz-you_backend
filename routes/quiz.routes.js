const router = require("express").Router();
const isAuthenticated = require('../middleware/isAuthenticated')

const Quiz = require('../models/Quiz.model')
const Question = require('../models/Question.model')
const User = require('../models/User.model')

// quiz crud routes

async function deleteQuestions(quiz) {
    // iterates through each question id in quiz
    // deletes the questions by that id
    quiz.questions.map(async (question) => {
        await Question.findByIdAndDelete(question._id.toString())
    })
}

async function createQuestions(newQuestionContent) {
    // iterates through an array of new question information
    // creates a new question
    // saves the question's id in an array
    // returns all the question ids
    let questionObjIds = []
    for (let j = 0; j < newQuestionContent.length; j++) {
        let question = newQuestionContent[j]
        question = {
            title: question.title,
            questionText: question.questionText,
            answers: question.answers
        }
        questionObjIds.push(await Question.create(question))
    }
    return questionObjIds
}

router.post("/create", isAuthenticated, async (req, res, next) => {
    // creates a new quiz
    // creates all the questions
    // sets the owner to the id of the owner
    // sets the quiz questions to the array of ids returned
    // create a new quiz with the data of the new quiz
    // returns the quiz id

    try {
        let { quiz } = req.body

        quiz.owner = req.user._id

        let questionObjIds = await createQuestions(quiz.questions)
        quiz.questions = questionObjIds

        let createdQuizId = (await Quiz.create(quiz))._id
        res.json({ createdId: createdQuizId })
    }
    catch (error) {
        next('quiz creation failed')
    }
});

// #TODO needs to be owner
router.patch('/edit', async (req, res, next) => {
    // edits a quiz
    // gets all the quiz data
    // deletes all previously existing questions
    // creates questions for all questions present in the updated version
    // updates the quiz

    let { updatedQuiz, quizId } = req.body
    let originalQuiz = await Quiz.findById(quizId)
    if (originalQuiz) {
        updatedQuiz.owner = originalQuiz.owner
        deleteQuestions(originalQuiz)
        let questionObjIds = await createQuestions(updatedQuiz.questions)
        updatedQuiz.questions = questionObjIds

        await Quiz.findOneAndUpdate({ _id: quizId }, updatedQuiz)
        res.json('edit')
    }
    else {
        console.log('quiz not found')
    }
})

// #TODO needs to be owner
router.post('/delete', async (req, res, next) => {
    // deletes quiz and the questions it contains

    let { quizId } = req.body
    let quiz = await Quiz.findById(quizId)
    deleteQuestions(quiz)

    await Quiz.findByIdAndDelete(quizId)
    res.json('deleted')
})

// fetching quiz data

router.get("/getMultiple/:count/:offset/:query", async (req, res, next) => {
    try {
        // gets count number of quizzes max and filters for all quizzes with a title containing the query text
        let { count, query, offset } = req.params
        let quizzes = await Quiz.find({
            title: {
                $regex: query,
                $options: 'i'
            }
        }).skip(offset).limit(count)
        res.json({ quizzes: quizzes })
    }
    catch (error) {
        console.log('find failed get multiple')
    }
})

// fetching quiz data

router.get(`/getQuizWithPoints/:quizId`, async (req, res, next) => {
    // fetches quiz by id and populates questions
    // different from getById as the points are also sent to the client
    try {
        let { quizId } = req.params
        let quiz = await Quiz.findById(quizId).populate('questions')
        res.json({ quiz })
    }
    catch (error) {
        console.log('find failed quiz by id')
    }
})

router.get('/getById/:quizId', async (req, res, next) => {
    // fetches quiz by id and populates questions
    // filters out the points for each question 
    try {
        let { quizId } = req.params
        let quiz = await Quiz.findById(quizId).populate('questions', { 'questionText': 1, 'answers': { 'content': 1 } })
        res.json({ quiz })
    }
    catch (error) {
        console.log('find failed quiz by id')
    }
})

router.post('/getScore', async (req, res, next) => {
    try {
        let { id, answers } = req.body
        let total = 0
        let max = 0
        let questions = (await Quiz.find({ _id: id }, { questions: 1 }).populate('questions'))[0].questions
        for (let i = 0; i < answers.length; i++) {
            let curAnswerInd = answers[i]
            let curQuestion = questions[i]
            let curMax = 0
            if (typeof curAnswerInd === 'number') {
                let curAnswerValue = curQuestion['answers'][curAnswerInd]['points']
                total += curAnswerValue
            }
            for (currentAnsIteration of curQuestion['answers']) {
                let answerPoints = currentAnsIteration.points
                if (curMax < answerPoints) {
                    curMax = answerPoints
                }
            }
            max += curMax
        }
        res.json({ total, max })
    }
    catch (error) {
        console.log("error")
    }
})

module.exports = router;
