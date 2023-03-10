const mongoose = require("../db");

const Quiz = require('../models/Quiz-model')
const Question = require('../models/Question-model')
const User = require('../models/User.model')

async function seed(){
    const users = require('./user.json')
    const quizzes = require('./quiz.json')

    const userObjIds = {}
    await Promise.all([
        User.deleteMany(),
        Quiz.deleteMany(),
        Question.deleteMany(),
    ])

    for(let i = 0; i < users.length; i++){
        userObjIds[users[i].username] = await User.create(users[i])
    }

    for (let i = 0; i < quizzes.length; i++){
        let quiz = quizzes[i]
        let questionObjIds = []
        for (let j = 0; j < quiz.questions.length; j++){
            questionObjIds.push(await Question.create(quiz.questions[j]))
        }
        quiz.owner = userObjIds[quiz.owner]
        quiz.questions = questionObjIds
        await Quiz.create(quiz)
    }

    console.log('connection closed')
    mongoose.connection.close();
}


// for (curQuestions of quiz.questions){
//     questionObjIds.push(await Questions.create(curQuestions))
// }
// quiz.owner = await User.findOne({username: quiz.owner})
// quiz.questions = questionObjIds
// await Quiz.create(quiz)
seed()