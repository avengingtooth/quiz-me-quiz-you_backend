const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const quizSchema = new Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        questions: [
            type: Schema.Types.ObjectId,
            ref: 'Question',
            required: true,
        ],
    },
    {
        // this second object adds extra properties: `createdAt` and `updatedAt`    
        timestamps: true
    }
);

const Quiz = model("Quiz", quizSchema);

module.exports = Quiz;
