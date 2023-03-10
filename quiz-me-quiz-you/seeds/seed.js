const mongoose = require('mongoose')
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/quiz-me-quiz-you'

const users = require('./user.json')
const quizzes = require('./quiz.json')
const questions = require('./question.json')

const User = require('../models/User.model')
const Quiz = require('../models/Quiz-model')
const Question = require('../models/Question-model')

mongoose
    .set('strictQuery', false)
    .connect(MONGO_URI)
    .then(async (x) => {
        try {
            const dbName = x.connections[0].name
            await seedUsers()
            await seedQuizzes()
            await seedQuestions()

            await mongoose.disconnect()
        } catch (error) {
            console.error(error)
        }
    })
    .catch((err) => {
        console.error('Error connecting to mondo: ', err)
    })

async function seedUsers() {
    try {
        await User.deleteMany()
        await User.create(users)
    } catch (error) {
        console.log(error);
    }
}

async function seedQuizzes() {
    try {
        await Quiz.deleteMany()
        for (const quiz of quizzes) {
            const user = await User.findOne({ username: quiz.owner })
            quiz.owner = user._id;
        }
        await Quiz.create(quizzes)
    } catch (error) {
        console.log(error);
    }
}

async function seedQuestions() {
    try {
        await Question.deleteMany()
        await Question.create(questions)
    } catch (error) {
        console.log(error);
    }
}