const mongoose = require("../db");

const User = require('../models/User.model')
const Quiz = require('../models/Quiz-model')
const Question = require('../models/Question-model')

async function seed(){
    const users = require('./user.json')
    const quizzes = require('./quiz.json')
    const questions = require('./question.json')
    const userObjIds = {}
    await Promise.all([
        User.deleteMany(),
        Quiz.deleteMany(),
        Question.deleteMany(),
    ])

    for(let i = 0; i < users.length; i++){
        userObjIds[users[i].username] = await User.create(users[i])
    }

    for(let i = 0; i < quizzes.length; i++){
        let quiz = quizzes[i]
        let questionObjIds = []
        for(let i = 0; i < quiz.questions.length; i++){
            questionObjIds.push(await Question.create(quiz.questions[i]))
        }
        quiz.owner = userObjIds[quiz.owner]
        quiz.questions = questionObjIds
        await Quiz.create(quiz)
    }

    mongoose.connection.close();
}

// mongoose
//     .set('strictQuery', false)
//     .connect(MONGO_URI)
//     .then(async (x) => {
//         try {
//             const dbName = x.connections[0].name
//             await seedUsers()
//             await seedQuizzes()
//             await seedQuestions()

//             await mongoose.disconnect()
//         } catch (error) {
//             console.error(error)
//         }
//     })
//     .catch((err) => {
//         console.error('Error connecting to mondo: ', err)
//     })

// async function seedUsers() {
//     try {
//         await User.deleteMany()
//         await User.create(users)
//     } catch (error) {
//         console.log(error);
//     }
// }

// async function seedQuizzes() {
//     try {
//         await Quiz.deleteMany()
//         for (const quiz of quizzes) {
//             const user = await User.findOne({ username: quiz.owner })
//             quiz.owner = user._id;
//         }
//         await Quiz.create(quizzes)
//     } catch (error) {
//         console.log(error);
//     }
// }

// async function seedQuestions() {
//     try {
//         await Question.deleteMany()
//         await Question.create(questions)
//     } catch (error) {
//         console.log(error);
//     }
// }

seed()